from flask import Blueprint
api_bp = Blueprint('api_blueprint', __name__)


@api_bp.route('/')
def hello_world():
    return 'Hello to the API!'
