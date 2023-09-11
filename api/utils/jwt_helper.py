import base64
import hashlib
import hmac
import json
import time


class JWTError(Exception):
    """Base class for JWT errors."""
    pass


class JWTExpiredError(JWTError):
    """JWT has expired."""
    pass


class JWTInvalidError(JWTError):
    """JWT is invalid."""
    pass


def base64_encode(input: bytes):
    """Encode bytes to base64, stripping any trailing padding."""
    return base64.urlsafe_b64encode(input).rstrip(b"=")


def base64_decode(input: bytes):
    """Decode base64 to bytes, adding any trailing padding.
    As we need to ensure that the base64 is always a multiple of 4."""
    return base64.urlsafe_b64decode(input + b"=" * (4 - len(input) % 4))


def create_jwt(exp, uid, secret: str):
    """Create a JWT for a user."""

    header = {
        "alg": "HS256",
        "typ": "JWT"
    }

    payload = {
        "exp": exp,
        "uid": uid
    }

    header_json = json.dumps(header, separators=(
        ",", ":"), sort_keys=True).encode("utf-8")
    payload_json = json.dumps(payload, separators=(
        ",", ":"), sort_keys=True).encode("utf-8")

    header_b64 = base64_encode(header_json)
    payload_b64 = base64_encode(payload_json)

    msg = header_b64 + b"." + payload_b64

    secret_bytes = secret.encode("utf-8")
    signature = hmac.new(secret_bytes, msg, hashlib.sha256).digest()
    signature_b64 = base64_encode(signature)

    jwt = header_b64 + b"." + payload_b64 + b"." + signature_b64

    return jwt.decode("utf-8")


def decode_jwt(jwt: str, secret: str):
    """Decode and validates a JWT."""

    jwt_bytes = jwt.encode("utf-8")

    secret_bytes = secret.encode("utf-8")

    try:
        header_b64, payload_b64, signature_b64 = jwt_bytes.split(b".")
    except ValueError:
        raise JWTInvalidError("JWT is invalid")

    try:
        header = json.loads(base64_decode(header_b64))
        payload = json.loads(base64_decode(payload_b64))
    except (json.JSONDecodeError, ValueError):
        raise JWTInvalidError("JWT is invalid")

    alg = header.get("alg")
    typ = header.get("typ")

    if alg is None or typ is None:
        raise JWTInvalidError("JWT is invalid")

    if header["alg"] != "HS256":
        raise JWTInvalidError("JWT is invalid")

    if header["typ"] != "JWT":
        raise JWTInvalidError("JWT is invalid")

    curnt_time = time.time()

    if payload["exp"] < curnt_time:
        raise JWTExpiredError("JWT has expired")

    msg = header_b64 + b"." + payload_b64

    signature = base64_decode(signature_b64)
    expected_signature = hmac.new(secret_bytes, msg, hashlib.sha256).digest()

    if not hmac.compare_digest(signature, expected_signature):
        raise JWTInvalidError("JWT is invalid")

    return header, payload


def create_jwt_expiration(expiration_seconds: int):
    """Create a JWT expiration from a number of seconds."""

    return time.time() + expiration_seconds
