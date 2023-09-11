import pytest
from middleware.image import validate_mimetype, image_validated
from werkzeug.datastructures import FileStorage, Headers
from flask import Flask
import secrets
import os

app = Flask(__name__)
# This is a random secret, only 16 as it is just for testing
app.config["JWT_SECRET"] = secrets.token_urlsafe(16)


@pytest.fixture(scope="module")
def test_client():
    flask_app = app
    os.environ["TESTING"] = "True"
    testing_client = flask_app.test_client()
    ctx = flask_app.app_context()
    ctx.push()
    yield testing_client
    ctx.pop()


@app.route("/image_upload_route", methods=["POST"])
@image_validated()
def image_upload_route():
    return "Image uploaded"


def test_check_mimetype():
    with open("tests/test_data/small.jpg", "rb") as f:
        file = FileStorage(f, headers=Headers({"Content-Type": "image/jpeg"}))
        validate_mimetype(file)

    with open("tests/test_data/small.png", "rb") as f:
        file = FileStorage(f, headers=Headers({"Content-Type": "image/png"}))
        validate_mimetype(file)

    # This is a gif, but the mimetype is set to jpeg
    with open("tests/test_data/small.gif", "rb") as f:
        file = FileStorage(f, headers=Headers({"Content-Type": "image/jpeg"}))
        with pytest.raises(ValueError):
            validate_mimetype(file)

    # Test with totally invalid mimetype
    with open("tests/test_data/invalid", "rb") as f:
        file = FileStorage(f, headers=Headers({"Content-Type": "image/jpeg"}))
        with pytest.raises(ValueError):
            validate_mimetype(file)

    # Test with invalid mimetype
    with open("tests/test_data/small.png", "rb") as f:
        file = FileStorage(f, headers=Headers(
            {"Content-Type": "invalid/mimetype"}))
        with pytest.raises(ValueError):
            validate_mimetype(file)

    # Test with obiously too small file

    with open("tests/test_data/too_small", "rb") as f:
        file = FileStorage(f, headers=Headers({"Content-Type": "image/jpeg"}))
        with pytest.raises(ValueError):
            validate_mimetype(file)


def test_image_upload_route(test_client):
    with open("tests/test_data/small.png", "rb") as f:
        response = test_client.post(
            "/image_upload_route",
            data={"image": (f, "small.png")},
            content_type="multipart/form-data"
        )
        assert response.status_code == 200
        assert response.data == b"Image uploaded"

    with open("tests/test_data/small.jpg", "rb") as f:
        response = test_client.post(
            "/image_upload_route",
            data={"image": (f, "small.jpg")},
            content_type="multipart/form-data"
        )
        assert response.status_code == 200
        assert response.data == b"Image uploaded"

    with open("tests/test_data/small.gif", "rb") as f:
        response = test_client.post(
            "/image_upload_route",
            data={"image": (f, "small.gif")},
            content_type="multipart/form-data"
        )
        assert response.status_code == 200
        assert response.data == b"Image uploaded"

    # Test with invalid mimetype
    with open("tests/test_data/invalid", "rb") as f:
        response = test_client.post(
            "/image_upload_route",
            data={"image": (f, "small.png")},
            content_type="multipart/form-data"
        )
        assert response.status_code == 400
        assert response.text == "Invalid mimetype"

    # Test with obiously too small file
    with open("tests/test_data/too_small", "rb") as f:
        response = test_client.post(
            "/image_upload_route",
            data={"image": (f, "too_small")},
            content_type="multipart/form-data"
        )
        assert response.status_code == 400
        assert response.data == b"Invalid mimetype"
