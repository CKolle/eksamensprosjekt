import pytest

from flask import Flask
import secrets
from middleware.auth import authorized
from utils.jwt_helper import create_jwt
from datetime import datetime
import os

app = Flask(__name__)
# This is a random secret, only 16 as it is just for testing
app.config["JWT_SECRET"] = secrets.token_urlsafe(16)


@app.route("/protected_test_route")
@authorized()
def protected_test_route(uid):
    return f"You are the user with id: {uid}"


@pytest.fixture(scope="module")
def test_client():
    flask_app = app
    os.environ["TESTING"] = "True"
    testing_client = flask_app.test_client()
    ctx = flask_app.app_context()
    ctx.push()
    yield testing_client
    ctx.pop()


def test_protected_route(test_client):
    response = test_client.get("/protected_test_route")
    assert response.status_code == 401


def test_protected_route_with_auth(test_client):

    exp = datetime.now().timestamp() + 1000

    jwt = create_jwt(exp, 1, app.config["JWT_SECRET"])

    response = test_client.get(
        "/protected_test_route",
        headers={"Authorization": f"Bearer {jwt}"})

    assert response.status_code == 200
    assert response.text == "You are the user with id: 1"

    # Test with invalid jwt
    invalid_jwt = create_jwt(exp, 1, "invalid_secret")

    response = test_client.get(
        "/protected_test_route",
        headers={"Authorization": f"Bearer {invalid_jwt}"})

    assert response.status_code == 401
