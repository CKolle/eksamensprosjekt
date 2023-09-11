from sqlalchemy.orm import validates, mapped_column, Mapped, relationship
from sqlalchemy.types import Integer, String, DateTime
from sqlalchemy import ForeignKey, func
from werkzeug.security import generate_password_hash, check_password_hash
from typing import Optional
from . import Base
import re


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(
        String(50), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(50), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(128), nullable=False)
    profile_picture: Mapped[str] = mapped_column(
        String(50), nullable=False, default="placeholder-profile.jpg")
    banner_picture: Mapped[str] = mapped_column(
        String(50), nullable=False, default="placeholder-banner.jpg")
    about_me: Mapped[str] = mapped_column(
        String(200), nullable=False, default="")
    follows: Mapped[list["Follow"]] = relationship(
        "Follow", primaryjoin="User.id == Follow.follower_id", cascade="all, delete-orphan")
    posts: Mapped[list["Post"]] = relationship(
        "Post", primaryjoin="User.id == Post.uid", cascade="all, delete-orphan")
    comments: Mapped[list["Comment"]] = relationship(
        "Comment", primaryjoin="User.id == Comment.uid", cascade="all, delete-orphan")
    likes: Mapped[list["Like"]] = relationship(
        "Like", primaryjoin="User.id == Like.uid", cascade="all, delete-orphan")

    def __init__(self, username, email, password) -> None:
        super().__init__(username=username, email=email)

        # Raises ValueError if password is invalid
        self.set_password(password)

    def __repr__(self):
        return f"<User {self.username}>"

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)

    def set_password(self, password):
        self.validate_password(password)
        self.hashed_password = generate_password_hash(password)

    def validate_password(self, password):
        if len(password) < 8:
            raise ValueError(
                "Password must be at least 8 characters long")

        if len(password) > 128:
            raise ValueError(
                "Password must be at most 128 characters long")

    @validates("email")
    def validate_email(self, key, email: str):
        if not re.fullmatch(
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', email
        ):
            raise ValueError("Email must be valid")
        return email

    @validates("username")
    def validate_username(self, key, username):
        if ' ' in username:
            raise ValueError("Username must not contain spaces")
        if len(username) < 3:
            raise ValueError("Username must be at least 3 characters long")
        if len(username) > 50:
            raise ValueError("Username must be at most 50 characters long")
        return username

    @validates("profile_picture")
    def validate_profile_picture(self, key, profile_picture):
        if len(profile_picture) > 50:
            raise ValueError(
                "Profile picture must be at most 50 characters long")
        return profile_picture

    @validates("banner_picture")
    def validate_banner_picture(self, key, banner_picture):
        if len(banner_picture) > 50:
            raise ValueError(
                "Banner picture must be at most 50 characters long")
        return banner_picture

    @validates("about_me")
    def validate_about_me(self, key, about_me):
        if len(about_me) > 200:
            raise ValueError(
                "About me must be at most 200 characters long")
        return about_me


class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(70), nullable=False)
    content: Mapped[str] = mapped_column(String(200), nullable=False)
    uid: Mapped[int] = mapped_column(
        ForeignKey('users.id'), nullable=False)
    image: Mapped[str] = mapped_column(
        String(50), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())
    comments: Mapped[list["Comment"]] = relationship(
        "Comment", cascade="all, delete")
    likes: Mapped[list["Like"]] = relationship(
        "Like",
        cascade="all, delete")

    def __repr__(self):
        return f"<Post {self.title}>"

    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'uid': self.uid
        }

    @validates("title")
    def validate_title(self, key, title):
        if len(title) < 1:
            raise ValueError("Title must be at least 3 characters long")
        if len(title) > 70:
            raise ValueError("Title must be at most 70 characters long")
        return title


class Like(Base):
    __tablename__ = "likes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uid: Mapped[int] = mapped_column(ForeignKey('users.id'),
                                     nullable=False)
    pid: Mapped[int] = mapped_column(ForeignKey('posts.id'),
                                     nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'uid': self.uid,
            'pid': self.pid
        }


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content: Mapped[str] = mapped_column(String(100), nullable=False)
    uid: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'),
                                     nullable=False)
    pid: Mapped[int] = mapped_column(Integer, ForeignKey('posts.id'),
                                     nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'content': self.content,
            'uid': self.uid,
            'pid': self.pid
        }

    @validates("content")
    def validate_content(self, key, content: str):
        if content.isspace():
            raise ValueError("Content must not be empty")
        if len(content) < 1:
            raise ValueError("Content must be at least 3 characters long")
        if len(content) > 100:
            raise ValueError("Content must be at most 100 characters long")
        return content


class Follow(Base):
    __tablename__ = "follows"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    follower_id: Mapped[int] = mapped_column(ForeignKey('users.id'),
                                             nullable=False)
    followed_id: Mapped[int] = mapped_column(ForeignKey('users.id'),
                                             nullable=False)
    followed_date: Mapped[DateTime] = mapped_column(
        DateTime, default=func.now())
