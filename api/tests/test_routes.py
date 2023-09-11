from db import Base, get_session, get_engine, User
from utils.init_db import init_db
from flask.testing import FlaskClient
from app import app
import os
import pytest


@pytest.fixture(scope="module")
def testing_env():
    os.environ["TESTING"] = "True"
    yield
    del os.environ["TESTING"]


@pytest.fixture(scope="function")
def testing_db(testing_env):
    init_db()
    yield
    engine = get_engine()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(testing_db):
    Session = get_session()
    session = Session()
    yield session
    session.close()


def insert_alice():
    user = User(username="Alice",
                password="password",
                email="Alice@example.com")
    Session = get_session()
    session = Session()
    session.add(user)
    session.commit()
    session.close()


@pytest.fixture(scope="function")
def test_client(testing_db):
    flask_app = app
    os.environ["TESTING"] = "True"
    testing_client = flask_app.test_client()
    ctx = flask_app.app_context()
    ctx.push()
    yield testing_client
    ctx.pop()


def test_api_login_route(test_client: FlaskClient, db_session):
    insert_alice()

    # Test that Alice got inserted
    alice = db_session.query(User).filter(User.username == "Alice").first()
    assert alice is not None

    response = test_client.post(
        "/api/auth/login", json={"username": "Alice", "password": "password"}
    )

    json_data = response.json
    assert response.status_code == 200
    assert json_data is not None
    assert json_data["access_token"] is not None
    assert json_data["expiration"] is not None
    assert int(json_data["expiration"]) > 8

    # Test invalid username
    response = test_client.post(
        "/api/auth/login", json={"username": "Bob", "password": "password"}
    )
    assert response.status_code == 401

    # Test invalid password
    response = test_client.post(
        "/api/auth/login", json={"username": "Alice", "password": "passwor"}
    )
    assert response.status_code == 401

    # Test extra fields
    response = test_client.post(
        "/api/auth/login",
        json={"username": "Alice", "password": "password",
              "gibberish": "gibberish"},
    )
    assert response.status_code == 400

    # Test missing fields
    response = test_client.post(
        "/api/auth/login", json={"username": "Alice"}
    )
    assert response.status_code == 400


def test_api_register_route(test_client: FlaskClient, db_session):

    # Test that Alice got inserted
    response = test_client.post(
        "/api/auth/register",
        json={"username": "Alice", "password": "password",
              "email": "alice@example.com"},
    )
    assert response.status_code == 200

    # Test that Alice got inserted
    response = test_client.post(
        "/api/auth/register",
        json={"username": "Alice", "password": "password",
              "email": "alice@example.com"},
    )
    assert response.status_code == 409

    # Try adding Sheila
    response = test_client.post(
        "/api/auth/register",
        json={"username": "Sheila", "password": "password",
              "email": "sheila@example.com"},
    )
    assert response.status_code == 200

    # Try invalid username too short
    response = test_client.post(
        "/api/auth/register",
        json={"username": "Li", "password": "password",
              "email": "Li@example.com"},
    )
    assert response.status_code == 400

    # Try invalid username too long
    response = test_client.post(
        "/api/auth/register",
        json={"username": "L" * 100, "password": "password",
              "email": "Li@example.com"},
    )
    assert response.status_code == 400

    # Try invalid password too short
    response = test_client.post(
        "/api/auth/register",
        json={"username": "Bob", "password": "pass", "email": "bob@bob.com"}
    )
    assert response.status_code == 400

    # Try invalid password too long
    response = test_client.post(
        "/api/auth/register",
        json={"username": "Bob", "password": "pass" * 100,
              "email": "bob@bob.com"}
    )
    assert response.status_code == 400

    # Try invalid email
    response = test_client.post(
        "/api/auth/register",
        json={"username": "Bob", "password": "password", "email": "bob"}
    )
    assert response.status_code == 400

    # Try an extra field
    response = test_client.post(
        "/api/auth/register",
        json={"username": "Bob", "password": "password",
              "email": "bob", "gibberish": "gibberish"}
    )
    assert response.status_code == 400

    # Try a missing field
    response = test_client.post(
        "/api/auth/register",
        json={"username": "Bob", "password": "password"}
    )
    assert response.status_code == 400

    # Try a login
    response = test_client.post(
        "/api/auth/login",
        json={"username": "Alice", "password": "password"},
    )
    assert response.status_code == 200


def test_api_users_route(test_client: FlaskClient, db_session):
    insert_alice()
    # Requires static images/users folder to be served
    if not os.path.exists("static/images/users"):
        os.makedirs("static/images/users")

    # Test that Alice got inserted
    alice = db_session.query(User).filter(User.username == "Alice").first()
    alice_id = alice.id
    assert alice is not None

    # Test that Alice can be retrieved
    response = test_client.get(f"/api/users/{alice_id}")
    assert response.status_code == 200
    json_data = response.json
    assert json_data is not None
    assert json_data["username"] == "Alice"

    # Login as Alice
    response = test_client.post(
        "/api/auth/login", json={"username": "Alice", "password": "password"}
    )
    if response.json is None:
        pytest.fail("No JSON data returned")
    jwt_token = response.json["access_token"]

    # Try updating Alice's username
    response = test_client.put(
        f"/api/users/{alice_id}",
        json={"username": "Alice2"},
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert response.status_code == 200

    # Try updating Alice's profile picture
    with open("tests/test_data/small.png", "rb") as f:
        response = test_client.put(
            f"/api/users/{alice_id}/profile-picture",
            data={"image": (f, "small.png")},
            headers={"Authorization": f"Bearer {jwt_token}"},
        )
        assert response.status_code == 200

    # Try changing Alice's username to an existing username
    response = test_client.post(
        "/api/auth/register",
        json={"username": "Sheila", "password": "password",
              "email": "sheilda@email.com"},
    )
    assert response.status_code == 200

    response = test_client.put(
        f"/api/users/{alice_id}",
        json={"username": "Sheila"},
        headers={"Authorization": f"Bearer {jwt_token}"},
    )

    assert response.status_code == 409

    # Clean up
    response = test_client.get(f"/api/users/{alice_id}")
    if response.json is None:
        pytest.fail("No JSON data returned")
    profile_pic = response.json["profile_picture"]
    os.remove("static/images/users/" + profile_pic)
