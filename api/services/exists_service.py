from sqlalchemy import select
from sqlalchemy.orm import Session
from db import Post, Comment, Like, User


class ExistsError(Exception):
    """Raised when data is not found in database"""
    pass


class UserExistsError(ExistsError):
    """Raised when user is not found in database"""
    pass


class PostExistsError(ExistsError):
    """Raised when post is not found in database"""
    pass


class LikeExistsError(ExistsError):
    """Raised when like is not found in database"""
    pass


class CommentExistsError(ExistsError):
    """Raised when comment is not found in database"""
    pass


def exists_by_id(session: Session, uid=None, pid=None, lid=None, cid=None):
    """Check if data exists in database
    and raise error if not found, and close session"""

    if uid:
        stmt = (
            select(User).where(User.id == uid)
        )
        exists = session.scalars(stmt).first()
        if not exists:
            session.close()
            raise UserExistsError("User not found")

    if pid:
        stmt = (
            select(Post).where(Post.id == pid)
        )
        exists = session.scalars(stmt).first()
        if not exists:
            session.close()
            raise PostExistsError("Post not found")

    if lid:
        stmt = (
            select(Like).where(Like.id == lid)
        )
        exists = session.scalars(stmt).first()
        if not exists:
            session.close()
            raise LikeExistsError("Like not found")

    if cid:
        stmt = (
            select(Comment).where(Comment.id == cid)
        )
        exists = session.scalars(stmt).first()
        if not exists:
            session.close()
            raise CommentExistsError("Comment not found")
