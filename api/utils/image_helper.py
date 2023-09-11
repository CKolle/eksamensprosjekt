def get_extension_from_mimetype(mimetype: str):
    """Get the file extension from a mimetype."""
    extensions = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/gif": "gif",
    }
    return extensions.get(mimetype, None)
