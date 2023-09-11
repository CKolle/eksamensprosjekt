from functools import wraps
from flask import request, Response, current_app
from utils.jwt_helper import decode_jwt
from db import get_session, User
from sqlalchemy import select


def authorized():
    """Decorator for routes that require authentication.
    Will return a 401 if the user is not authenticated.
    The user id will be passed to the route as a keyword argument called uid.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if "Authorization" not in request.headers:
                return Response(status=401)

            jwt = request.headers["Authorization"].split(' ')[1]

            try:
                secret = current_app.config["JWT_SECRET"]
                # Will raise an exception if the JWT is invalid
                _, payload = decode_jwt(jwt, secret)
            except Exception:
                return Response(status=401)

            Session = get_session()
            session = Session()

            stmt = (
                select(User)
                .where(User.id == payload["uid"])
            )

            user = session.scalars(stmt).first()
            session.close()

            if user is None:
                return Response(status=401)

            kwargs["uid"] = payload["uid"]

            return f(*args, **kwargs)
        return decorated_function
    return decorator
