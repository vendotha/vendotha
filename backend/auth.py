import os
import httpx
from fastapi import HTTPException, Header
from typing import Optional
import json
import time
import jwt
from cryptography.hazmat.primitives import serialization
from cryptography.x509 import load_pem_x509_certificate

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "vendotha@gmail.com")
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "")

_certs_cache: dict = {}
_certs_expiry: float = 0

async def get_google_certs() -> dict:
    global _certs_cache, _certs_expiry
    if time.time() < _certs_expiry and _certs_cache:
        return _certs_cache
    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
        )
        res.raise_for_status()
        _certs_cache = res.json()
        # Cache for 1 hour
        _certs_expiry = time.time() + 3600
        return _certs_cache

async def verify_admin_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1]

    try:
        # Decode header to get kid
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        certs = await get_google_certs()
        if kid not in certs:
            raise HTTPException(status_code=401, detail="Invalid token key ID")

        # Load public key from cert
        cert_pem = certs[kid].encode("utf-8")
        cert = load_pem_x509_certificate(cert_pem)
        public_key = cert.public_key()

        # Verify token
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=FIREBASE_PROJECT_ID,
            options={"verify_exp": True},
        )

        email = payload.get("email", "")
        if email != ADMIN_EMAIL:
            raise HTTPException(status_code=403, detail="Access denied")

        return email

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth failed: {str(e)}")
