from functools import wraps
from flask import request, Response
from werkzeug.datastructures import FileStorage
from typing import Callable

mimetype_check = []


def check_png(header: bytes):
    """Check if the file is a png."""
    if header.startswith(b"\x89\x50\x4e\x47\x0d\x0a\x1a\x0a"):
        return "image/png"


mimetype_check.append(check_png)


def check_jpg(header: bytes):
    """Checks if the file is a jpg. For both JPEG data as EXIF or JFIF."""
    if header[6:10] in (b"Exif", b"JFIF"):
        return "image/jpeg"


mimetype_check.append(check_jpg)


def check_gif(header: bytes):
    """Checks if the file is a gif. For both GIF87a and GIF89a."""
    if header.startswith(b"GIF87a") or header.startswith(b"GIF89a"):
        return "image/gif"


mimetype_check.append(check_gif)


def validate_mimetype(file: FileStorage,
                      allowed_mimetypes: list[str] | None = None):
    """Check if the mimetype of the file is allowed.
    By reading the file's magic number and comparing it to the allowed
    mimetypes and the header mimetype."""

    if allowed_mimetypes is None:
        allowed_mimetypes = ["image/png", "image/jpeg", "image/gif"]

    # Perform a basic check of the mimetype
    if file.mimetype not in allowed_mimetypes:
        raise ValueError("Invalid mimetype")

    # More thorough check of the mimetype to prevent file extension spoofing
    # Stops simple file extension spoofing, but does not validate the file
    try:
        magic_number_bytes = file.stream.read(512)
    except Exception:
        # This should never happen, but just in case
        raise ValueError("Invalid mimetype, could not read file")

    # Reset the file stream
    file.stream.seek(0)

    valid_mimetype = None
    for check in mimetype_check:
        valid_mimetype = check(magic_number_bytes)
        if valid_mimetype is not None:
            break

    if valid_mimetype is None:
        raise ValueError("Invalid mimetype")

    if file.mimetype != valid_mimetype:
        raise ValueError("Invalid mimetype, mimetype does not match header")


def validate_img_size(file: FileStorage, max_size: int, min_size: int):
    """Validate the size of the image."""
    byte_stream = file.stream.read()
    if len(byte_stream) > max_size:
        raise ValueError("File too large")

    if len(byte_stream) < min_size:
        raise ValueError("File too small")


def image_validated(allowed_mimetypes: list[str] | None = None,
                    max_size: int = 5 * 1024 * 1024, min_size: int = 1,
                    is_multipart: bool = False):
    """Decorator for routes that expects an image as the request file.
       If no allowed mimetypes are specified,
       the decorator will only allow png, jpeg and gif."""
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if "image" not in request.files and is_multipart:
                return f(*args, **kwargs)

            if "image" not in request.files:
                return Response(status=400, response="No file provided")

            file: FileStorage = request.files["image"]

            if not file.filename:
                return Response(status=400, response="Invalid file")

            try:
                # The order of the checks are important
                validate_mimetype(file, allowed_mimetypes)
                validate_img_size(file, max_size, min_size)
            except ValueError as e:
                return Response(status=400, response=str(e))

            return f(*args, **kwargs)
        return decorated_function
    return decorator
