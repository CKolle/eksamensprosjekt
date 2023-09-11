import hashlib
import hmac
import datetime
import pytest

from utils.jwt_helper import (create_jwt,
                              base64_encode,
                              base64_decode,
                              decode_jwt,
                              JWTInvalidError,
                              JWTExpiredError)
import json


def test_base64_encode():

    input_bytes = b"test"
    expected_output = b"dGVzdA"

    assert base64_encode(input_bytes) == expected_output

    input_bytes = b"test2=="
    expected_output = b"dGVzdDI9PQ"

    assert base64_encode(input_bytes) == expected_output


def test_base64_decode():

    input_bytes = b"dGVzdA"
    expected_output = b"test"

    assert base64_decode(input_bytes) == expected_output

    input_bytes = b"dGVzdDI9PQ"
    expected_output = b"test2=="

    assert base64_decode(input_bytes) == expected_output


def test_create_jwt():
    """Test creating a JWT.
    And also test the extract_jwt function. As they are used together."""

    uid = 1
    exp = datetime.datetime.now().timestamp() + 1000
    secret = "secret"

    jwt = create_jwt(exp, uid, secret)

    header, payload = decode_jwt(jwt, secret)

    assert header["alg"] == "HS256"
    assert header["typ"] == "JWT"

    assert payload["exp"] == exp
    assert payload["uid"] == uid

    # Test that the JWT is url safe

    assert jwt == jwt.replace("+", "-").replace("/", "_")

    # Test if the JWT signature is correct

    jwt = jwt.encode("utf-8")
    header_b64, payload_b64, signature_b64 = jwt.split(b'.')
    msg = header_b64 + b'.' + payload_b64

    signature = base64_decode(signature_b64)
    expected_signature = hmac.new(secret.encode(
        'utf-8'), msg, hashlib.sha256).digest()

    assert hmac.compare_digest(signature, expected_signature)

    # Test that the JWT is a string
    jwt = create_jwt(exp, uid, secret)
    assert isinstance(jwt, str)


def test_decode_jwt():

    secret = "secret"
    invalid_secret = "invalid_secret"

    uid = 1
    exp = datetime.datetime.now().timestamp() + 1000

    jwt = create_jwt(exp, uid, secret)

    # Test that the JWT is valid

    header, payload = decode_jwt(jwt, secret)

    assert header["alg"] == "HS256"
    assert header["typ"] == "JWT"

    assert payload["exp"] == exp
    assert payload["uid"] == uid

    # Test that the JWT is invalid
    with pytest.raises(Exception):
        decode_jwt(jwt, invalid_secret)

    # Test with gibberish
    with pytest.raises(Exception):
        decode_jwt("gibberish", secret)

    # Test that the JWT is expired

    exp = datetime.datetime.now().timestamp() - 1000

    jwt = create_jwt(exp, uid, secret)

    with pytest.raises(JWTExpiredError):
        decode_jwt(jwt, secret)

    # Test with invalid header (alg)

    jwt = create_jwt(exp, uid, secret)

    header = jwt.split(".")[0]
    header = base64_decode(header.encode("utf-8"))
    header = header.replace(b"HS256", b"gibrish")  # Invalid header
    header = base64_encode(header).decode("utf-8")

    jwt = header + "." + ".".join(jwt.split(".")[1:])

    with pytest.raises(JWTInvalidError):
        decode_jwt(jwt, secret)

    # Test with invalid header (typ)

    jwt = create_jwt(exp, uid, secret)

    header = jwt.split(".")[0]
    header = base64_decode(header.encode("utf-8"))
    header = json.loads(header.decode("utf-8"))
    header["typ"] = "gibrish"  # Invalid header
    header = base64_encode(json.dumps(header).encode("utf-8")).decode("utf-8")

    jwt = header + "." + ".".join(jwt.split(".")[1:])

    with pytest.raises(JWTInvalidError):
        decode_jwt(jwt, secret)

    # Test with removed headers keys

    jwt = create_jwt(exp, uid, secret)

    header = jwt.split(".")[0]
    header = base64_decode(header.encode("utf-8"))
    header = json.loads(header.decode("utf-8"))
    del header["alg"]  # Invalid header
    header = base64_encode(json.dumps(header).encode("utf-8")).decode("utf-8")

    jwt = header + "." + ".".join(jwt.split(".")[1:])
    with pytest.raises(JWTInvalidError):
        decode_jwt(jwt, secret)

    # Test with gibberish header

    jwt = create_jwt(exp, uid, secret)

    header = jwt.split(".")[0]
    header = "gibberish"  # Invalid header

    jwt = header + "." + ".".join(jwt.split(".")[1:])

    with pytest.raises(JWTInvalidError):
        decode_jwt(jwt, secret)
