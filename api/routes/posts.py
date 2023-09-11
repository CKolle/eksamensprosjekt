from flask import Blueprint, request, Response, jsonify
from db import get_session, Post, Comment, Like
from middleware import authorized
from sqlalchemy import select, func
from services import exists_service


"""
NB: This blueprint file is responsible for retrieving and displaying posts
and their associated metadata. Associated metadata includes things such as
comments and likes.

This blueprint should not be used to handle actions such as creating, editing,
or deleting posts, or updating the metadata associated with a post. Instead,
these actions should be handled in the users blueprint route, specifically at
the endpoint /users/<uid>/posts.

"""


posts_bp = Blueprint('posts_blueprint', __name__)


@posts_bp.route("/<int:pid_param>", methods=["GET"])
@authorized()
def get_post(pid_param, uid):
    """Get a single post"""
    Session = get_session()
    session = Session()

    comment_count_sub_stmt = (
        select(func.count(Comment.id))
        .where(Comment.pid == Post.id)
        .scalar_subquery()
    )

    like_count_sub_stmt = (
        select(func.count(Like.id))
        .where(Like.pid == Post.id)
        .scalar_subquery()
    )
    stmt = (
        select(Post, like_count_sub_stmt, comment_count_sub_stmt)
        .where(Post.id == pid_param)
        .group_by(Post.id)
    )

    post = session.execute(stmt).first()

    session.close()

    if post is None:
        return Response("Post not found", 404)

    response = {
        "id": post[0].id,
        "uid": post[0].uid,
        "title": post[0].title,
        "content": post[0].content,
        "created_at": post[0].created_at,
        "image": post[0].image,
        "like_count": post[1],
        "comment_count": post[2]
    }

    return jsonify(response)


@posts_bp.route("/", methods=["GET"])
@authorized()
def get_posts(uid):
    """Gets posts """

    try:
        page_size: int = int(request.args.get('page_size', 10))
        last_id: int = int(request.args.get('last_id', 0))
        query: str = request.args.get('query', '')
        liked_by: int = int(request.args.get('liked_by', 0))
    except ValueError:
        return Response("Bad request", 400)

    Session = get_session()
    session = Session()

    comment_count_sub_stmt = (
        select(func.count(Comment.id))
        .where(Comment.pid == Post.id)
        .scalar_subquery()
    )

    like_count_sub_stmt = (
        select(func.count(Like.id))
        .where(Like.pid == Post.id)
        .scalar_subquery()
    )

    stmt = (
        select(Post, like_count_sub_stmt, comment_count_sub_stmt)
        .where(Post.title.ilike(f"%{query}%") | Post.content.ilike(f"%{query}%"))
        .group_by(Post.id)
        .limit(page_size)
    )

    if last_id:
        compersion_operator = Post.id > last_id
        stmt = stmt.where(compersion_operator)

    if liked_by:
        stmt = (
            stmt
            .where(
                Post.id.in_(
                    select(Like.pid)
                    .where(Like.uid == liked_by)
                )
            )
        )

    posts = session.execute(stmt).all()
    session.close()

    response = [{
        "id": post[0].id,
        "uid": post[0].uid,
        "title": post[0].title,
        "content": post[0].content,
        "created_at": post[0].created_at,
        "image": post[0].image,
        "like_count": post[1],
        "comment_count": post[2]
    } for post in posts]

    return jsonify(response)


@posts_bp.route("/<int:pid_param>/likes", methods=["GET"])
@authorized()
def get_likes_for_post(pid_param, uid):
    """Get all likes for a post"""
    try:
        page_size: int = int(request.args.get('page_size', 10))
        last_id: int = int(request.args.get('last_id', 0))
        descending: bool = bool(request.args.get(
            'descending', 'True').lower() == 'true')
    except ValueError:
        return Response("Bad request", 400)

    Session = get_session()
    session = Session()

    try:
        exists_service.exists_by_id(session, pid=pid_param)
    except exists_service.ExistsError as e:
        return Response(str(e), 404)

    stmt = (
        select(Like)
        .where(Like.pid == pid_param)
        .limit(page_size)
        .order_by(Like.id.desc() if descending else None)
    )

    if last_id:
        compersion_operator = Like.id < last_id if descending else Like.id > last_id
        stmt = stmt.where(compersion_operator)

    likes = session.scalars(stmt).all()
    session.close()

    if not likes:
        return Response("Post have no likes", 204)

    return jsonify([like.serialize() for like in likes])


@posts_bp.route("/<int:pid_param>/comments", methods=["GET"])
@authorized()
def get_comments_for_post(pid_param, uid):
    """Get comments for post"""

    try:
        page_size: int = int(request.args.get('page_size', 10))
        last_id: int = int(request.args.get('last_id', 0))
        descending: bool = bool(request.args.get(
            'descending', 'True').lower() == 'true')
    except ValueError:
        return Response("Bad request", 400)

    Session = get_session()
    session = Session()

    try:
        exists_service.exists_by_id(session, pid=pid_param)
    except exists_service.ExistsError as e:
        return Response(str(e), 404)

    stmt = (
        select(Comment)
        .where(Comment.pid == pid_param)
        .limit(page_size)
        .order_by(Comment.id.desc() if descending else None)
    )

    if last_id:
        compersion_operator = Comment.id < last_id if descending else Comment.id > last_id
        stmt = stmt.where(compersion_operator)

    comments = session.scalars(stmt).all()
    session.close()

    return jsonify([comment.serialize() for comment in comments])
