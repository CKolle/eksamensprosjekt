from middleware import authorized, image_validated
from services import user_service, exists_service, post_service
from flask import Blueprint, request, Response, jsonify
from db import get_session, User, Post, Like, Comment, Follow
from sqlalchemy import select, func

users_bp = Blueprint("users_blueprint", __name__)


@users_bp.route("/<int:uid_param>", methods=["GET"])
def get_user(uid_param):
    """Get a user's profile"""

    Session = get_session()
    session = Session()

    stmt = (
        select(User).where(User.id == uid_param)
    )
    user = session.scalars(stmt).first()
    session.close()

    if user is None:
        return Response("User not found", 404)

    response = {
        "id": user.id,
        "username": user.username,
        "profile_picture": user.profile_picture,
        "banner_picture": user.banner_picture,
        "about_me": user.about_me,
    }

    return jsonify(response)


@users_bp.route("/", methods=["GET"])
@authorized()
def get_users(uid):

    try:
        page_size = int(request.args.get("page_size", 10))
        last_id = int(request.args.get("last_id", 0))
        query = request.args.get("query", "")
    except ValueError:
        return Response("Bad request", 400)

    Session = get_session()
    session = Session()

    stmt = (
        select(User)
        .where(User.username.ilike(f"%{query}%"))
        .limit(page_size)
    )

    if last_id:
        stmt = stmt.where(User.id < last_id)

    users = session.scalars(stmt).all()
    session.close()

    response = [{
        "id": user.id,
        "username": user.username,
        "profile_picture": user.profile_picture,
    } for user in users]

    return jsonify(response)


@users_bp.route("/<int:uid_param>", methods=["PUT"])
@authorized()
def update_user(uid_param, uid):
    """Update a user's profile"""

    if uid_param != uid:
        return Response(status=401)

    Session = get_session()
    session = Session()

    stmt = (
        select(User).where(User.id == uid_param)
    )

    user = session.scalars(stmt).first()

    if user is None:
        session.close()
        return Response("User not found", 404)

    has_modifications = False

    request_data: dict = request.get_json()

    username = request_data.get("username")
    about_me = request_data.get("about_me")
    new_password = request_data.get("new_password")
    old_password = request_data.get("old_password")
    email = request_data.get("email")

    response = {}

    if username:
        stmt = (
            select(User.username).where(User.username == username)
        )
        if session.execute(stmt).first():
            session.close()
            return Response("Username already exists", 409)
        try:
            user.username = username
        except ValueError as e:
            session.close()
            return Response(str(e), 400)
        response["username"] = username
        has_modifications = True

    if about_me:
        try:
            user.about_me = about_me
        except ValueError as e:
            session.close()
            return Response(str(e), 400)
        response["about_me"] = about_me
        has_modifications = True

    if new_password and old_password:
        if not user.check_password(old_password):
            session.close()
            return Response("Incorrect password", 401)
        try:
            user.set_password(new_password)
        except ValueError as e:
            session.close()
            return Response(str(e), 400)
        has_modifications = True

    if email:
        try:
            user.email = email
        except ValueError as e:
            session.close()
            return Response(str(e), 400)
        response["email"] = email
        has_modifications = True

    session.commit()
    session.close()

    if not has_modifications:
        return Response("No modifications", 200)

    return jsonify(response)


@users_bp.route("/<int:uid_param>/profile-picture", methods=["PUT"])
@authorized()
@image_validated()
def update_profile_picture(uid_param, uid):
    """Update a user's profile picture"""

    if uid_param != uid:
        return Response(status=401)

    Session = get_session()
    session = Session()

    stmt = (
        select(User).where(User.id == uid_param)
    )

    user = session.scalars(stmt).first()

    if user is None:
        session.close()
        return Response("User not found", 404)

    filename = user_service.update_profile_picture(
        user, request.files["image"], session)

    session.close()

    return jsonify({"profile_picture": filename})


@users_bp.route("/<int:uid_param>/banner-picture", methods=["PUT"])
@authorized()
@image_validated(allowed_mimetypes=["image/jpeg", "image/png"])
def update_banner(uid_param, uid):
    """Update a user's banner"""

    if uid_param != uid:
        return Response(status=401)

    Session = get_session()
    session = Session()

    stmt = (
        select(User).where(User.id == uid_param)
    )

    user = session.scalars(stmt).first()

    if user is None:
        session.close()
        return Response("User not found", 404)

    old_banner = user.banner_picture
    filename = user_service.update_image_banner(
        request.files["image"], old_banner)

    user.banner_picture = filename
    session.commit()
    session.close()

    return jsonify({"banner_picture": filename})


@users_bp.route("/<int:uid_param>", methods=["DELETE"])
@authorized()
def delete_user(uid_param, uid):
    if uid_param != uid:
        return Response(status=401)

    Session = get_session()
    session = Session()

    stmt = (
        select(User).where(User.id == uid_param)
    )

    user = session.scalars(stmt).first()

    if user is None:
        session.close()
        return Response("User not found", 404)

    session.delete(user)
    session.commit()
    session.close()

    return Response(status=204)

# User posts


@users_bp.route("/<int:uid_param>/posts", methods=["GET"])
@authorized()
def get_posts_for_user(uid_param, uid):
    """Get posts made by user"""

    try:
        page_size: int = int(request.args.get('page_size', 10))
        last_id: int = int(request.args.get('last_id', 0))
        descending: bool = bool(
            (request.args.get('descending', 'True').lower() == 'true'))
        has_image: bool = bool(request.args.get('has_image', False))
    except ValueError:
        return Response("Bad request", 400)

    Session = get_session()
    session = Session()

    try:
        exists_service.exists_by_id(session, uid=uid)
    except exists_service.ExistsError as e:
        return Response(str(e), 404)

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
        .where(Post.uid == uid_param)
        .group_by(Post.id)
        .limit(page_size)
        .order_by(Post.id.desc() if descending else None)
    )

    if last_id:
        comperison_operator = Post.id < last_id if descending else Post.id > last_id
        stmt = stmt.where(comperison_operator)

    if has_image:
        stmt = stmt.where(Post.image != None)

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


@users_bp.route("/<int:uid_param>/posts", methods=["POST"])
@authorized()
@image_validated(is_multipart=True)
def create_post(uid_param, uid):
    """Create a post"""
    if uid != uid_param:
        return Response(status=401)

    title = request.form.get('title')
    content = request.form.get('content')

    if not title:
        return Response("Post needs title", 400)

    if not content:
        return Response("Post needs content", 400)

    Session = get_session()
    session = Session()

    try:
        new_post = Post(uid=uid, title=title, content=content)
        if request.files:
            filename = post_service.save_post_image(
                request.files["image"])
            new_post.image = filename

    except ValueError as e:
        session.close()
        return Response(str(e), 400)

    session.add(new_post)
    session.commit()
    session.refresh(new_post)
    session.close()

    response = {
        "id": new_post.id,
    }
    return jsonify(response)


@users_bp.route("/<int:uid_param>/posts/<int:pid_param>", methods=["DELETE"])
@authorized()
def delete_post(uid_param, pid_param, uid):
    """Delete a post"""
    if uid != uid_param:
        return Response(status=401)

    Session = get_session()
    session = Session()

    post = session.scalars(select(Post).where(Post.id == pid_param)).first()

    if not post:
        session.close()
        return Response("Post not found", 404)

    session.delete(post)
    session.commit()
    session.close()
    return Response('Post deleted succsessfully!', 204)


@users_bp.route("/<int:uid_param>/posts/feed", methods=["GET"])
@authorized()
def get_feed(uid_param, uid):
    """Get the users feed"""
    if uid != uid_param:
        return Response(status=401)

    Session = get_session()
    session = Session()

    try:
        last_id = int(request.args.get('last_id', 0))
        page_size = int(request.args.get('page_size', 10))
    except TypeError:
        return Response("Invalid query parameters", 400)

    user = session.scalars(select(User).where(User.id == uid)).first()

    if not user:
        session.close()
        return Response("User not found", 404)

    followers = session.scalars(
        select(Follow).where(Follow.follower_id == uid)).all()

    if not followers:
        session.close()
        return Response("User has no followers", 404)

    follower_ids = [follower.followed_id for follower in followers]

    like_count_sub_stmt = (
        select(func.count(Like.id))
        .where(Like.pid == Post.id)
        .label("like_count")
    )

    comment_count_sub_stmt = (
        select(func.count(Comment.id))
        .where(Comment.pid == Post.id)
        .label("comment_count")
    )

    stmt = (
        select(Post, like_count_sub_stmt, comment_count_sub_stmt)
        .where(Post.uid.in_(follower_ids))
        .order_by(Post.id.desc())
        .limit(page_size)
    )

    if last_id:
        stmt = stmt.where(Post.id < last_id)

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


# User likes


@users_bp.route("/<int:uid_param>/posts/<int:pid_param>/likes", methods=["GET"])
@authorized()
def get_post_like(uid_param, pid_param, uid):
    """Get the like status of a post"""
    if uid != uid_param:
        return Response(status=401)

    Session = get_session()
    session = Session()

    try:
        exists_service.exists_by_id(session, pid=pid_param)
    except exists_service.ExistsError as e:
        return Response(str(e), 404)

    like = session.scalars(select(Like).where(
        Like.uid == uid).where(Like.pid == pid_param)).first()
    session.close()

    if not like:
        response = {
            "is_liked": False,
            "id": None,
            "uid": uid,
            "pid": pid_param,
        }
        return jsonify(response)

    response = {
        "is_liked": True,
        "id": like.id,
        "uid": like.uid,
        "pid": like.pid,
    }

    return jsonify(response)


@users_bp.route(
    "/<int:uid_param>/posts/<int:pid_param>/likes", methods=["POST"])
@authorized()
def like_post(uid_param, pid_param, uid):
    """Like a post"""
    if uid != uid_param:
        return Response(status=401)

    Session = get_session()
    session = Session()

    try:
        exists_service.exists_by_id(session, pid=pid_param)
    except exists_service.ExistsError as e:
        return Response(str(e), 404)

    like = session.scalars(select(Like).where(
        Like.uid == uid).where(Like.pid == pid_param)).first()
    if like:
        session.close()
        return Response("Post already liked", 409)

    new_like = Like(uid=uid, pid=pid_param)
    session.add(new_like)
    session.commit()
    session.refresh(new_like)
    session.close()

    response = {
        "uid": new_like.uid,
        "pid": new_like.pid,
    }

    return jsonify(response)


@users_bp.route(
    "/<int:uid_param>/posts/<int:pid_param>/likes", methods=["DELETE"])
@authorized()
def unlike_post(uid_param, pid_param, uid):
    """Unlike a post"""
    if uid != uid_param:
        return Response(status=401)

    Session = get_session()
    session = Session()

    try:
        exists_service.exists_by_id(session, pid=pid_param)
    except exists_service.ExistsError as e:
        return Response(str(e), 404)

    like = session.scalars(select(Like).where(
        Like.uid == uid).where(Like.pid == pid_param)).first()
    if not like:
        session.close()
        return Response("Post not liked", 404)

    session.delete(like)
    session.commit()
    session.close()
    return Response('Post unliked succsessfully!', 204)

# User comments


@users_bp.route("/<int:uid_param>/posts/<int:pid_param>/comments",
                methods=["GET"])
@authorized()
def get_comments_for_user(uid_param, pid_param, uid):
    """Get comments made by user"""
    if uid != uid_param:
        return Response(status=401)

    try:
        page_size: int = int(request.args.get('page_size', 10))
        last_id: int = int(request.args.get('last_id', 0))
        descending: bool = bool(
            (request.args.get('descending', 'True').lower() == 'true'))
    except ValueError:
        return Response("Bad request", 400)

    Session = get_session()
    session = Session()

    try:
        exists_service.exists_by_id(session, pid=pid_param)
    except exists_service.ExistsError as e:
        return Response(str(e), 404)

    if not last_id:
        stmt = (
            select(Comment)
            .where(Comment.uid == uid)
            .where(Comment.pid == pid_param)
            .order_by(Comment.id.desc() if descending else None)
        )
    else:
        stmt = (
            select(Comment)
            .where(Comment.uid == uid)
            .where(Comment.pid == pid_param)
            .where(Comment.id < last_id if descending else Comment.id > last_id)  # noqa
            .order_by(Comment.id.desc() if descending else None)
        )

    comments = session.scalars(stmt.limit(page_size)).all()
    session.close()

    if not comments:
        return Response("No comments found", 404)

    response = [comment.serialize() for comment in comments]

    return jsonify(response)


@users_bp.route(
    "/<int:uid_param>/posts/<int:pid_param>/comments", methods=["POST"])
@authorized()
def create_comment(uid_param, pid_param, uid):
    """Create a comment"""
    if uid != uid_param:
        return Response(status=401)

    request_data: dict = request.get_json()
    try:
        content = request_data.get('content')
    except AttributeError:
        return Response("Bad request", 400)

    if not content:
        return Response("Comment needs content", 400)

    Session = get_session()
    session = Session()

    post = session.scalars(select(Post).where(Post.id == pid_param)).first()

    if not post:
        session.close()
        return Response("Post not found", 404)

    try:
        new_comment = Comment(uid=uid, pid=pid_param, content=content)
    except ValueError as e:
        session.close()
        return Response(str(e), 400)
    session.add(new_comment)
    session.commit()
    session.refresh(new_comment)
    session.close()

    response = {
        "id": new_comment.id,
        "uid": new_comment.uid,
        "pid": new_comment.pid,
        "content": new_comment.content,
    }
    return jsonify(response)

# Follow


@users_bp.route("/<int:uid_param>/follows/<int:followed_id>", methods=["POST"])
@authorized()
def follow_user(uid_param, followed_id, uid):
    """Follow a user"""
    if uid != uid_param:
        return Response(status=401)

    if uid == followed_id:
        return Response("User cannot follow themselves", 400)

    Session = get_session()
    session = Session()

    try:
        exists_service.exists_by_id(session, uid=followed_id)
    except exists_service.ExistsError as e:
        return Response(str(e), 404)

    stmt = (
        select(Follow)
        .where(Follow.follower_id == uid)
        .where(Follow.followed_id == followed_id)
    )
    follow = session.scalars(stmt).first()

    if follow:
        session.close()
        return Response("User already followed", 400)

    try:
        new_follow = Follow(follower_id=uid, followed_id=followed_id)
    except ValueError as e:
        session.close()
        return Response(str(e), 400)

    session.add(new_follow)
    session.commit()
    session.refresh(new_follow)
    session.close()

    response = {
        "follower_id": new_follow.follower_id,
        "followed_id": new_follow.followed_id,
    }

    return jsonify(response)


@users_bp.route("/<int:uid_param>/follows", methods=["GET"])
@authorized()
def get_following(uid_param, uid):
    """Get users followed by user"""

    try:
        page_size: int = int(request.args.get('page_size', 10))
        last_id: int = int(request.args.get('last_id', 0))
    except ValueError:
        return Response("Invalid query params", 400)

    Session = get_session()
    session = Session()

    try:
        exists_service.exists_by_id(session, uid=uid_param)
    except exists_service.ExistsError as e:
        return Response(str(e), 404)

    stmt = (
        select(User)
        .join(Follow, Follow.followed_id == User.id)
        .where(Follow.follower_id == uid_param)
    )

    if last_id:
        stmt = stmt.where(User.id < last_id)

    users = session.scalars(stmt.limit(page_size)).all()
    session.close()

    response = [{
        "id": user.id,
        "username": user.username,
        "profile_picture": user.profile_picture
    } for user in users]

    return jsonify(response)


@users_bp.route("/<int:uid_param>/follows/<int:followed_id>", methods=["GET"])
@authorized()
def get_follow(uid_param, followed_id, uid):
    """Get follow relationship between two users"""

    Session = get_session()
    session = Session()

    try:
        exists_service.exists_by_id(session, uid=uid_param)
    except exists_service.ExistsError as e:
        return Response(str(e), 404)

    stmt = (
        select(Follow)
        .where(Follow.follower_id == uid_param)
        .where(Follow.followed_id == followed_id)
    )

    follow = session.scalars(stmt).first()
    session.close()

    if not follow:
        response = {
            "is_following": False,
        }
        return jsonify(response)

    response = {
        "is_following": True,
        "followed_date": follow.followed_date,
    }

    return jsonify(response)


@users_bp.route("/<int:uid_param>/follows/<int:followed_id>", methods=["DELETE"])
@authorized()
def unfollow_user(uid_param, followed_id, uid):
    """Unfollow a user"""
    if uid != uid_param:
        return Response(status=401)

    Session = get_session()
    session = Session()

    try:
        exists_service.exists_by_id(session, uid=followed_id)
    except exists_service.ExistsError as e:
        return Response(str(e), 404)

    stmt = (
        select(Follow)
        .where(Follow.follower_id == uid)
        .where(Follow.followed_id == followed_id)
    )
    follow = session.scalars(stmt).first()

    if not follow:
        session.close()
        return Response("User not followed", 400)

    session.delete(follow)
    session.commit()
    session.close()

    return Response(status=204)
