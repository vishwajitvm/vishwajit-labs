"""Admin token checks: MongoDB hash, ADMIN_TOKEN env, and the locked default.

    cd apps/api && python -m pytest tests -q
"""
import hashlib

import pytest
from fastapi.testclient import TestClient

import main
from app.core import security
from app.core.config import settings

DB_TOKEN = "db-token-" + "x" * 30
ENV_TOKEN = "env-token-" + "y" * 30


class FakeCollection:
    def __init__(self, doc):
        self.doc = doc

    async def find_one(self, query):
        return self.doc if self.doc and query.get("_id") == self.doc.get("_id") else None


class FakeDB:
    def __init__(self, doc=None):
        self.col = FakeCollection(doc)

    def __getitem__(self, name):
        assert name == "admin_settings"
        return self.col


@pytest.fixture
def client(monkeypatch):
    def setup(doc=None, env=None, db=True):
        security._cache.update(until=0.0, hash=None)
        monkeypatch.setattr(settings, "ADMIN_TOKEN", env)
        monkeypatch.setattr(security, "get_database", lambda: FakeDB(doc) if db else None)
        monkeypatch.setattr(security.asyncio, "sleep", _no_sleep)
        return TestClient(main.app)  # not a context manager: no startup, no real DB
    return setup


async def _no_sleep(_):
    return None


def verify(c, token=None):
    headers = {"Authorization": f"Bearer {token}"} if token is not None else {}
    return c.post("/api/auth/verify", headers=headers).status_code


def admin_doc(token):
    return {"_id": "admin", "token_sha256": hashlib.sha256(token.encode()).hexdigest()}


def test_locked_when_nothing_configured(client):
    c = client()
    assert verify(c, DB_TOKEN) == 503
    assert c.get("/api/analytics/dashboard-stats").status_code == 503


def test_token_hash_in_mongodb(client):
    c = client(doc=admin_doc(DB_TOKEN))
    assert verify(c, DB_TOKEN) == 200
    assert verify(c, "wrong-token") == 401
    assert verify(c) == 401
    assert verify(c, admin_doc(DB_TOKEN)["token_sha256"]) == 401  # the hash itself is not a password


def test_env_token(client):
    c = client(env=ENV_TOKEN)
    assert verify(c, ENV_TOKEN) == 200
    assert verify(c, "wrong-token") == 401


def test_both_configured(client):
    c = client(doc=admin_doc(DB_TOKEN), env=ENV_TOKEN)
    assert verify(c, DB_TOKEN) == 200
    assert verify(c, ENV_TOKEN) == 200


def test_short_env_token_and_bad_hash_stay_locked(client):
    c = client(doc={"_id": "admin", "token_sha256": "not-a-hash"}, env="short")
    assert verify(c, "short") == 503


def test_database_down_falls_back_to_env(client):
    c = client(env=ENV_TOKEN, db=False)
    assert verify(c, ENV_TOKEN) == 200
    c2 = client(db=False)
    assert verify(c2, DB_TOKEN) == 503
