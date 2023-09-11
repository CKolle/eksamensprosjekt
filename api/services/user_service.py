import os
from db.models import User
from sqlalchemy.orm import Session
from werkzeug.datastructures import FileStorage
from utils.image_helper import get_extension_from_mimetype
import secrets


class UsernameExists(Exception):
    pass


def update_username(user: User, new_username: str, session: Session):
    """Updates the username of a user """
    existing_user = session.query(User).filter_by(
        username=new_username).first()
    if existing_user is not None:
        raise UsernameExists("Username already exists")
    user.username = new_username
    session.commit()


def update_profile_picture(user: User,
                           new_profile_picture: FileStorage,
                           session: Session):
    """Updates the profile picture of a user """
    old_profile_picture = user.profile_picture
    mimetype = new_profile_picture.mimetype
    extension = get_extension_from_mimetype(mimetype)
    filename = f"{secrets.token_hex(8)}.{extension}"
    user.profile_picture = filename
    # Reset the stream position to the beginning
    new_profile_picture.stream.seek(0)

    if old_profile_picture and old_profile_picture != "placeholder-profile.jpg":
        try:
            os.remove(f"static/images/users/{old_profile_picture}")
        except FileNotFoundError:
            pass
    new_profile_picture.save(f"static/images/users/{filename}")
    session.commit()
    return filename


def update_image_banner(new_image: FileStorage, old_image_name: str):
    """Handles the storage part of updating an image """

    mimetype = new_image.mimetype
    extension = get_extension_from_mimetype(mimetype)
    filename = f"{secrets.token_hex(8)}.{extension}"

    # Reset the stream position to the beginning
    new_image.stream.seek(0)

    if old_image_name and old_image_name != "placeholder-banner.jpg":
        try:
            os.remove(f"static/images/users/{old_image_name}")
        except FileNotFoundError:
            pass
    new_image.save(f"static/images/users/{filename}")
    return filename
