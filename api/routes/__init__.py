from .api import api_bp
from .users import users_bp
from .auth import auth_bp
from .posts import posts_bp


def register_routes(app):
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(posts_bp, url_prefix='/api/posts')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
