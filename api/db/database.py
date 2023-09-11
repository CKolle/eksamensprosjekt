from sqlalchemy import create_engine as sqlalchemy_create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base
import os

engine = None
Session = None

Base = declarative_base()


def create_engine():
    global engine
    if os.environ.get("TESTING") == "True":
        engine = sqlalchemy_create_engine("sqlite:///:memory:", echo=True)
    else:
        engine = sqlalchemy_create_engine("sqlite:///database.db", echo=True)


def create_session():
    global Session
    if engine is None:
        raise Exception("Engine needs to be created before the session maker")
    Session = sessionmaker(bind=engine)


def get_session():
    """Returns the session factory.
    If the session factory is not created, it will create it"""
    if engine is None:
        create_engine()
    if Session is None:
        create_session()

    # Helps with type checking, but can't be reached
    if Session is None:
        raise Exception("Session is None")

    return Session


def get_engine():
    if engine is None:
        create_engine()
    return engine
