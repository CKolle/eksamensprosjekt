import secrets
from werkzeug.datastructures import FileStorage
from utils.image_helper import get_extension_from_mimetype


def save_post_image(post_image: FileStorage) -> str:
    """Saves a post image to the static/images/posts directory """
    mimetype = post_image.mimetype
    extension = get_extension_from_mimetype(mimetype)
    filename = f"{secrets.token_hex(8)}.{extension}"

    # Reset the stream position to the beginning
    post_image.stream.seek(0)

    post_image.save(f"static/images/posts/{filename}")
    return filename
