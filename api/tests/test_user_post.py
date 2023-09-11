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


def test_user_post(test_client: FlaskClient, db_session: Session):

    insert_alice()
    insert_sheila()

    # Test that Alice got inserted
    alice = db_session.scalars(select(User).where(
        User.username == "Alice")).first()

    assert alice is not None

    # Test that Alice can be retrieved

    response = test_client.get("api/users/1")
    assert response.status_code == 200

    # Login as Alice

    response = test_client.post("api/auth/login", json={
        "username": "Alice",
        "password": "password"
    })
    assert response.status_code == 200

    # Get JWT token

    if response.json is None:
        pytest.fail("No JSON data returned")
    jwt_token = response.json["access_token"]

    # Test that Alice can post
    # Use multipart/form-data instead of JSON
    response = test_client.post(
        "api/users/1/posts",
        headers={"Authorization": f"Bearer {jwt_token}"},
        data={
            "title": "Hello",
            "content": "This is a test post"
        })
    assert response.status_code == 200

    # Insert a lot of dummy posts to test pagination

    for _ in range(100):
        insert_dummy_post(1)

    # Test that Alice can retrieve her posts

    response = test_client.get(
        "api/users/1/posts",
        headers={"Authorization": f"Bearer {jwt_token}"})
    assert response.status_code == 200

    # Should return the 10 most recent posts
    posts = response.json
    if posts is None:
        pytest.fail("No JSON data returned")

    assert len(posts) == 10

    # Check that the post where the most recent

    for i in range(10):
        assert posts[i]["id"] == 101 - i

    # Test increasing order

    response = test_client.get(
        "api/users/1/posts?descending=false",
        headers={"Authorization": f"Bearer {jwt_token}"})

    posts = response.json
    if posts is None:
        pytest.fail("No JSON data returned")

    assert len(posts) == 10

    for i in range(10):
        assert posts[i]["id"] == 1 + i

    # Test larger page size (20)

    response = test_client.get(
        "api/users/1/posts?page_size=20",
        headers={"Authorization": f"Bearer {jwt_token}"})
    assert response.status_code == 200

    posts = response.json
    if posts is None:
        pytest.fail("No JSON data returned")

    assert len(posts) == 20

    # Check that the post where the most recent

    for i in range(20):
        assert posts[i]["id"] == 101 - i

    # Test post last_id parameter

    response = test_client.get(
        "api/users/1/posts?last_id=91",
        headers={"Authorization": f"Bearer {jwt_token}"})
    posts = response.json
    if posts is None:
        pytest.fail("No JSON data returned")

    assert len(posts) == 10

    # Check that the post where the most recent

    for i in range(10):
        assert posts[i]["id"] == 90 - i

    # Test post last_id parameter with descending=false

    response = test_client.get(
        "api/users/1/posts?last_id=11&descending=false",
        headers={"Authorization": f"Bearer {jwt_token}"})
    posts = response.json
    if posts is None:
        pytest.fail("No JSON data returned")

    assert len(posts) == 10

    for i in range(10):
        assert posts[i]["id"] == 12 + i


def test_user_post_comments(test_client: FlaskClient, db_session: Session):

    insert_alice()
    insert_dummy_post(1)

    # Test that Alice got inserted
    alice = db_session.scalars(select(User).where(
        User.username == "Alice")).first()

    if alice is None:
        pytest.fail("Alice not inserted")

    # Test that post got inserted

    post = db_session.scalars(select(Post).where(Post.uid == 1)).first()

    if post is None:
        pytest.fail("Post not inserted")

    # Login as Alice

    response = test_client.post("api/auth/login", json={
        "username": "Alice",
        "password": "password"
    })

    assert response.status_code == 200

    # Get JWT token

    if response.json is None:

        pytest.fail("No JSON data returned")

    jwt_token = response.json["access_token"]

    # Test that Alice can comment

    response = test_client.post("api/users/1/posts/1/comments", json={
        "content": "This is Alice's first comment"
    },
        headers={"Authorization": f"Bearer {jwt_token}"},
        content_type="application/json")

    assert response.status_code == 200

    # Test that Alice can retrieve her comments

    response = test_client.get(
        "api/users/1/posts/1/comments",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    # Insert a lot of dummy comments to test pagination

    for _ in range(100):
        insert_dummy_comment(1, 1)

    # Test that Alice can retrieve her comments

    response = test_client.get(
        "api/users/1/posts/1/comments",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    # Should return the 10 most recent comments

    comments = response.json
    if comments is None:
        pytest.fail("No JSON data returned")

    assert len(comments) == 10

    # Check that the comments where the most recent

    for i in range(10):
        assert comments[i]["id"] == 101 - i

    # Test increasing order

    response = test_client.get(
        "api/users/1/posts/1/comments?descending=false",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    comments = response.json
    if comments is None:
        pytest.fail("No JSON data returned")

    assert len(comments) == 10

    for i in range(10):
        assert comments[i]["id"] == 1 + i

    # Test larger page size (20)

    response = test_client.get(
        "api/users/1/posts/1/comments?page_size=20",
        headers={"Authorization": f"Bearer {jwt_token}"})
    assert response.status_code == 200

    comments = response.json
    if comments is None:
        pytest.fail("No JSON data returned")

    assert len(comments) == 20

    # Check that the comments where the most recent

    for i in range(20):
        assert comments[i]["id"] == 101 - i

    # Test post last_id parameter

    response = test_client.get(
        "api/users/1/posts/1/comments?last_id=91",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200
    comments = response.json

    if comments is None:
        pytest.fail("No JSON data returned")

    assert len(comments) == 10

    # Check that the comments where the most recent

    for i in range(10):
        assert comments[i]["id"] == 90 - i

    # Test post last_id parameter with descending=false

    response = test_client.get(
        "api/users/1/posts/1/comments?last_id=11&descending=false",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    comments = response.json
    if comments is None:
        pytest.fail("No JSON data returned")

    assert len(comments) == 10

    for i in range(10):
        assert comments[i]["id"] == 12 + i

    # Test editing a comment

    response = test_client.put("api/users/1/posts/1/comments/1", json={
        "content": "Alice is the best"
    },
        headers={"Authorization": f"Bearer {jwt_token}"},
        content_type="application/json")

    assert response.status_code == 200

    # Test that the comment was edited

    response = test_client.get(
        "api/users/1/posts/1/comments",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    # Test deleting a post that got a comment to ensure cascade delete works

    response = test_client.delete(
        "api/users/1/posts/1",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    # Test that the comment got deleted

    comment = db_session.scalars(
        select(Comment).where(Comment.uid == 1)).first()

    if comment is not None:
        pytest.fail("Comment not deleted")


def test_user_post_likes(test_client: FlaskClient, db_session: Session):

    # Insert Alice and a post

    insert_alice()
    insert_dummy_post(1)

    # Try to like the post without logging in

    response = test_client.post("api/users/1/posts/1/likes")

    assert response.status_code == 401

    # Login as Alice

    response = test_client.post("api/auth/login", json={
        "username": "Alice",
        "password": "password"
    })

    assert response.status_code == 200

    # Get JWT token

    if response.json is None:
        pytest.fail("No JSON data returned")

    jwt_token = response.json["access_token"]

    # Test that Alice can like the post

    response = test_client.post(
        "api/users/1/posts/1/likes",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    # Test that Alice can retrieve the likes

    response = test_client.get(
        "api/users/1/posts/1/likes",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200

    # Test that Alice can unlike the post

    response = test_client.delete(
        "api/users/1/posts/1/likes",
        headers={"Authorization": f"Bearer {jwt_token}"})

    assert response.status_code == 200
