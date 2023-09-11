from db import Base, get_session, get_engine, User
from utils.init_db import init_db
from sqlalchemy.orm import sessionmaker

import pytest
import os


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
    user = User(username="Alice", password="password",
                email="Alice@example.com")
    Session = get_session()
    session = Session()
    session.add(user)
    session.commit()
    session.close()


def test_get_engine(db_session):
    engine = get_engine()
    assert engine is not None


def test_get_session(db_session):
    Session = get_session()
    assert Session is not None

    # Check that the session is a session
    assert isinstance(Session, sessionmaker)

    # Check that the session is bound to the engine
    assert Session.kw["bind"] is not None

    # Check that you can create a session
    session = Session()
    assert session is not None

    # Check that the session can connect to the database
    assert session.bind is not None

    # Check that it connects to the memory database
    engine = get_engine()
    assert session.bind is engine


def test_create_user(db_session):
    Session = get_session()
    session = Session()

    user = User(username="Alice",
                email="alice@example.com",
                password="password")
    session.add(user)
    session.commit()

    # Retrieve the user from the database
    user = session.query(User).filter_by(username="Alice").first()
    assert user is not None
    assert user.username == "Alice"
    assert user.email == "alice@example.com"
    assert user.check_password("password")

    # Ensure invalid passwords are not allowed
    with pytest.raises(ValueError):
        user = User(username="Sheila", email="shiela@example.com", password="")

    # Ensure that short passwords are not allowed
    with pytest.raises(ValueError):
        user = User(username="Sheila",
                    email="shiela@example.com",
                    password="asf")

    # Ensure that invalid emails are not allowed
    with pytest.raises(ValueError):
        user = User(username="Sheila", email="sheila", password="password")

    # Test illegal emails
    with pytest.raises(ValueError):
        user = User(username="Sheila", email="sheila@", password="password")

    # Test empty emails
    with pytest.raises(ValueError):
        user = User(username="Sheila", email="", password="password")


def test_update_user(db_session):
    # Insert a dummy user
    insert_alice()

    Session = get_session()
    db_session = Session()

    # Retrieve the user from the database
    user = db_session.query(User).filter_by(username="Alice").first()
    assert user is not None
    user.username = "Bob"
    db_session.commit()

    # Ensure the user is updated
    user = db_session.query(User).filter_by(username="Bob").first()
    assert user is not None
    assert user.username == "Bob"

    # Change the username back to Alice
    user.username = "Alice"
    db_session.commit()

    # Ensure the user is updated
    user = db_session.query(User).filter_by(username="Alice").first()
    assert user is not None
    assert user.username == "Alice"

    db_session.close()


def test_delete_user(db_session):
    # Insert a dummy user
    insert_alice()

    Session = get_session()
    db_session = Session()

    # Retrieve the user from the database
    user = db_session.query(User).filter_by(username="Alice").first()
    db_session.delete(user)
    db_session.commit()

    # Ensure the user is deleted
    user = db_session.query(User).filter_by(username="Alice").first()

    assert user is None

    db_session.close()
