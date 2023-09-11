from flask import Blueprint, request, Response, jsonify, current_app
from db import get_session, User
from utils.jwt_helper import create_jwt, create_jwt_expiration
from sqlalchemy import select

auth_bp = Blueprint("auth_blueprint", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():

    try:
        data = request.get_json()
        username, password = data["username"], data["password"]
    except KeyError:
        return Response("Invalid request", 400)

    if len(data) != 2:
        return Response("Invalid request", 400)

    Session = get_session()
    session = Session()

    stmt = (
        select(User).where(User.username == username)
    )

    user = session.scalars(stmt).first()
    session.close()

    if user is None:
        return Response("Invalid credentials", 401)

    if not user.check_password(password):
        return Response("Invalid credentials", 401)

    expiration = create_jwt_expiration(current_app.config["JWT_TOKEN_EXPIRES"])
    secret = current_app.config["JWT_SECRET"]
    token = create_jwt(expiration, user.id, secret)

    response = {"access_token": token, "expiration": expiration}

    return jsonify(response)


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        username = data["username"]
        password = data["password"]
        email = data["email"]
    except KeyError:
        return Response("Invalid request", 400)

    if len(data) != 3:
        return Response("Invalid request", 400)

    Session = get_session()
    session = Session()

    stmt = (
        select(User).where(User.username == username)
    )
    user = session.scalars(stmt).first()

    if user is not None:
        return Response("Username already exists", 409)

    try:
        user = User(username=username, password=password, email=email)
        session.add(user)
        session.commit()
    except ValueError as e:
        session.close()
        return Response(str(e), 400)
    # Fetch the user again to get the id
    user = session.query(User).filter_by(username=username).first()
    if user is None:
        return Response("Internal server error", 500)
    session.close()

    expiration = create_jwt_expiration(current_app.config["JWT_TOKEN_EXPIRES"])
    secret = current_app.config["JWT_SECRET"]
    token = create_jwt(expiration, user.id, secret)

    response = {"access_token": token, "expiration": expiration}

    return jsonify(response)
