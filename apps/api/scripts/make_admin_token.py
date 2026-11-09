"""Make a new admin token for the /admin dashboard.

    python scripts/make_admin_token.py

Prints:
  - TOKEN: what you type into /admin. Keep it in a password manager; never paste it in chats.
  - HASH:  what goes into MongoDB, in the `admin_settings` collection:
           { "_id": "admin", "token_sha256": "<HASH>" }

Running it again makes a new token; replace the HASH in MongoDB to switch to it (the old one stops working).
"""
import hashlib
import secrets

token = secrets.token_urlsafe(32)
digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
print()
print("TOKEN (type this into /admin, keep it secret):")
print(f"  {token}")
print()
print("HASH (paste into MongoDB as token_sha256):")
print(f"  {digest}")
print()
print('MongoDB document, collection "admin_settings":')
print(f'  {{ "_id": "admin", "token_sha256": "{digest}" }}')
print()
