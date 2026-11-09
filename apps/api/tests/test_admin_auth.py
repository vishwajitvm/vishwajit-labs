"""Admin sign-in: account seeding, email + password login, sessions, and the older token options.

    cd apps/api && python -m pytest tests -q
"""
import asyncio
import hashlib
from collections import defaultdict
from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient

import main
from app.core import security
from app.core.config import settings

EMAIL = "admin@example.com"
PASSWORD = "test-password-for-ci-only"
ENV_TOKEN = "env-token-" + "y" * 30


class FakeCollection:
    def __init__(self):
        self.docs = {}

    @staticmethod
    def _match(d, q):
        for k, v in q.items():
            val = d.get(k)
            if isinstance(v, dict):
                if "$gt" in v and not (val is not None and val > v["$gt"]):
                    return False
                if "$lt" in v and not (val is not None and val < v["$lt"]):
                    return False
            elif val != v:
                return False
        return True

    async def find_one(self, q):
        return next((dict(d) for d in self.docs.values() if self._match(d, q)), None)

    async def insert_one(self, d):
        self.docs[d["_id"]] = dict(d)

    async def update_one(self, q, u, upsert=False):
        d = await self.find_one(q)
        if d is None:
            if not upsert:
                return
            d = {"_id": q["_id"], **u.get("$setOnInsert", {})}
        d.update(u.get("$set", {}))
        self.docs[d["_id"]] = d

    async def delete_one(self, q):
        for k, d in list(self.docs.items()):
            if self._match(d, q):
                del self.docs[k]
                return

    async def delete_many(self, q):
        for k, d in list(self.docs.items()):
            if self._match(d, q):
                del self.docs[k]

    async def count_documents(self, q, limit=0):
        return sum(1 for d in self.docs.values() if self._match(d, q))


class FakeDB:
    def __init__(self):
        self.cols = defaultdict(FakeCollection)

    def __getitem__(self, name):
        return self.cols[name]


async def _no_sleep(_):
    return None


@pytest.fixture
def env(monkeypatch):
    """Returns (client, db). Each test gets a fresh fake database and clean caches."""
    def make(password=None, token=None, db=True):
        fake = FakeDB() if db else None
        security._cache.update(until=0.0, hash=None)
        security._users_cache.update(until=0.0, any=False)
        security._attempts.clear()
        monkeypatch.setattr(security, "PBKDF2_ITER", 1000)  # fast hashing in tests
        monkeypatch.setattr(settings, "ADMIN_EMAIL", EMAIL)
        monkeypatch.setattr(settings, "ADMIN_PASSWORD", password)
        monkeypatch.setattr(settings, "ADMIN_TOKEN", token)
        monkeypatch.setattr(security, "get_database", lambda: fake)
        monkeypatch.setattr(security.asyncio, "sleep", _no_sleep)
        return TestClient(main.app), fake  # not a context manager: no real startup / DB
    return make


def login(c, email=EMAIL, password=PASSWORD):
    return c.post("/api/auth/login", json={"email": email, "password": password})


def stats(c, token=None):
    return c.get("/api/analytics/dashboard-stats", headers={"Authorization": f"Bearer {token}"} if token else {}).status_code


def test_locked_when_nothing_is_configured(env):
    c, _ = env()
    assert login(c).status_code == 503
    assert stats(c) == 503


def test_login_seeds_account_from_settings_and_stores_only_a_hash(env):
    c, db = env(password=PASSWORD)
    r = login(c)
    assert r.status_code == 200
    user = db[security.USERS].docs[EMAIL]
    assert PASSWORD not in str(user) and user["password_hash"].startswith("pbkdf2_sha256$")
    token = r.json()["token"]
    assert token not in str(db[security.SESSIONS].docs)  # sessions are stored hashed too
    assert stats(c, token) == 200


def test_email_is_case_insensitive(env):
    c, _ = env(password=PASSWORD)
    assert login(c, email="  Admin@Example.COM ").status_code == 200


def test_wrong_password_and_unknown_email(env):
    c, _ = env(password=PASSWORD)
    assert login(c, password="nope").status_code == 401
    assert login(c, email="someone@else.com").status_code == 401
    assert stats(c, "made-up-session-token") == 401
    assert stats(c) == 401


def test_rate_limit_after_ten_failures(env):
    c, _ = env(password=PASSWORD)
    for _ in range(10):
        login(c, password="nope")
    assert login(c).status_code == 429


def test_logout_and_expiry_end_the_session(env):
    c, db = env(password=PASSWORD)
    token = login(c).json()["token"]
    c.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert stats(c, token) == 401
    token = login(c).json()["token"]
    db[security.SESSIONS].docs[hashlib.sha256(token.encode()).hexdigest()]["expires_at"] = datetime.utcnow() - timedelta(seconds=1)
    assert stats(c, token) == 401


def test_changing_the_password_signs_out_old_sessions(env, monkeypatch):
    c, _ = env(password=PASSWORD)
    token = login(c).json()["token"]
    monkeypatch.setattr(settings, "ADMIN_PASSWORD", PASSWORD + "-new")
    asyncio.run(security.seed_admin_from_env())  # what the server does when it restarts with the new setting
    c2 = TestClient(main.app)
    assert login(c2, password=PASSWORD + "-new").status_code == 200
    assert stats(c, token) == 401
    assert login(c2).status_code == 401


def test_short_password_is_refused(env):
    c, _ = env(password="short")
    assert login(c, password="short").status_code == 503


def test_older_token_options_still_work(env):
    c, db = env(token=ENV_TOKEN)
    assert stats(c, ENV_TOKEN) == 200
    c, db = env()
    db[security.SETTINGS].docs["admin"] = {"_id": "admin", "token_sha256": hashlib.sha256(b"db-token-" + b"x" * 30).hexdigest()}
    assert stats(c, "db-token-" + "x" * 30) == 200


def test_database_down(env):
    c, _ = env(password=PASSWORD, db=False)
    assert login(c).status_code == 503
