from db import Base, get_session, get_engine, User, Post, Comment, Like
from utils.init_db import init_db
from flask.testing import FlaskClient
from sqlalchemy.orm import Session
from sqlalchemy import select
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


@pytest.fixture(scope="function")
def test_client(testing_db):
    flask_app = app
    os.environ["TESTING"] = "True"
    testing_client = flask_app.test_client()
    ctx = flask_app.app_context()
    ctx.push()
    yield testing_client
    ctx.pop()


def insert_alice():
    user = User(username="Alice",
                password="password",
                email="Alice@example.com")
    Session = get_session()
    session = Session()
    session.add(user)
    session.commit()
    session.close()


def insert_sheila():
    user = User(username="Sheila",
                password="password",
                email="Sheila@example.com")
    Session = get_session()
    session = Session()
    session.add(user)
    session.commit()
    session.close()


def insert_dummy_post(uid_param: int):
    """Insert dummy post with id """
    post = Post(title="Dummy post",
                content="This is a dummy post", uid=uid_param)
    Session = get_session()
    session = Session()
    session.add(post)
    session.commit()
    session.close()


def insert_dummy_comment(pid_param: int, uid_param: int):
    """Insert dummy comment with id """
    comment = Comment(content="Dummy comment", pid=pid_param, uid=uid_param)
    Session = get_session()
    session = Session()
    session.add(comment)
    session.commit()
    session.close()


def insert_dummy_like(pid_param: int, uid_param: int):
    """Insert dummy like with id """
    like = Like(pid=pid_param, uid=uid_param)
    Session = get_session()
    session = Session()
    session.add(like)
    session.commit()
    session.close()


def test_post(test_client: FlaskClient, db_session: Session):

    # Insert dummy user

    insert_alice()

    # Insert dummy post

    insert_dummy_post(1)

    # Login as Alice

    response = test_client.post("api/auth/login",
                                json={"username": "Alice",
                                      "password": "password"})

    assert response.status_code == 200

    # Get the jwt

    if response.json is None:
        pytest.fail("No JSON data returned")
    jwt_token = response.json["access_token"]

    # Get the post

    response = test_client.get(
        "api/posts/1",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    # Test the like coutner in the post

    insert_dummy_like(1, 1)

    response = test_client.get(
        "api/posts/1",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    if response.json is None:
        pytest.fail("No JSON data returned")

    assert response.json["like_count"] == 1

    # Test post pagination

    # Insert dummy posts

    for i in range(2, 20):
        insert_dummy_post(i)

    # Get the posts

    response = test_client.get(
        "api/posts",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    if response.json is None:
        pytest.fail("No JSON data returned")

    posts = response.json

    assert len(posts) == 10

    # Test post pagination with offset

    response = test_client.get(
        "api/posts?last_id=10",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    if response.json is None:
        pytest.fail("No JSON data returned")

    posts = response.json

    assert len(posts) == 9


def test_post_like(test_client: FlaskClient, db_session: Session):

    # Insert Alice

    insert_alice()

    # Insert Sheila

    insert_sheila()

    # Insert dummy post

    insert_dummy_post(1)

    # Login as Alice

    response = test_client.post("api/auth/login",
                                json={"username": "Alice",
                                      "password": "password"})
    assert response.status_code == 200

    # Get the jwt

    if response.json is None:
        pytest.fail("No JSON data returned")

    jwt_token = response.json["access_token"]

    # Like the post

    insert_dummy_like(1, 1)
    insert_dummy_like(1, 2)

    # Test the like count

    response = test_client.get(
        "api/posts/1/likes/count",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    if response.json is None:
        pytest.fail("No JSON data returned")

    assert response.json["like_count"] == 2

    # Test get likes

    response = test_client.get(
        "api/posts/1/likes",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    if response.json is None:
        pytest.fail("No JSON data returned")
    likes = response.json

    assert len(likes) == 2
    # NB: The order is in descending order of id,
    # meaning that the first is the last inserted
    assert likes[1]["uid"] == 1
    assert likes[0]["uid"] == 2

    # Generate a post with tons of likes

    #  First generate a lot of users

    # Warning: This is a very slow test due to the amount of users
    # and flask is not async
    for i in range(3, 100):
        user = User(username=f"User{i}",
                    password="password",
                    email=f"user{i}@example.com")
        db_session.add(user)
        db_session.commit()

    # Then generate a lot of likes

    for i in range(3, 100):
        like = Like(pid=1, uid=i)
        db_session.add(like)
        db_session.commit()

    # Test the like count

    response = test_client.get(
        "api/posts/1/likes/count",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    if response.json is None:
        pytest.fail("No JSON data returned")

    assert response.json["like_count"] == 99

    # Test get likes with pagination

    response = test_client.get(
        "api/posts/1/likes?page_size=20",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    if response.json is None:
        pytest.fail("No JSON data returned")
    likes = response.json

    assert len(likes) == 20
    # Test that the likes are in descending order,
    #  according to most recently liked

    assert likes[0]["uid"] == 99

    # Test get likes with pagination and last id

    response = test_client.get(
        "api/posts/1/likes?page_size=20&last_id=21",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    if response.json is None:
        pytest.fail("No JSON data returned")
    likes = response.json

    assert len(likes) == 20

    # Test that the likes are in descending order,

    assert likes[0]["uid"] == 20


def test_post_comment(test_client: FlaskClient, db_session: Session):

    # Insert Alice

    insert_alice()

    # Insert Sheila

    insert_sheila()

    # Insert dummy post

    insert_dummy_post(1)

    # Login as Alice

    response = test_client.post("api/auth/login",
                                json={"username": "Alice",
                                      "password": "password"})
    assert response.status_code == 200

    # Get the jwt

    if response.json is None:
        pytest.fail("No JSON data returned")

    jwt_token = response.json["access_token"]

    # Comment the post

    insert_dummy_comment(1, 1)
    insert_dummy_comment(1, 2)

    # Test the comment count

    response = test_client.get(
        "api/posts/1/comments/count",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    if response.json is None:
        pytest.fail("No JSON data returned")

    assert response.json["comment_count"] == 2

    # Test get comments

    response = test_client.get(
        "api/posts/1/comments",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    if response.json is None:
        pytest.fail("No JSON data returned")
    comments = response.json

    assert len(comments) == 2
    # NB: The order is in descending order of id,
    # meaning that the first is the last inserted
    assert comments[1]["uid"] == 1
    assert comments[0]["uid"] == 2
