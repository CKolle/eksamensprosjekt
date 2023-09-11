import os
import subprocess
import shutil


def build_static():
    """Builds the static files for the frontend.
    This is done by running the vite build whic
    which is located at ../client/vite.config.js.
    This should not be used in production.
    Only for quick building during development."""

    # Change the working directory to the client folder
    os.chdir("../client")

    # Clean the static folder for everything except in the images folder
    os.chdir("../api/static")
    for file in os.listdir():
        if file == "images":
            continue
        # Could be a file or a folder and the dir may not be empty
        os.remove(file) if os.path.isfile(file) else shutil.rmtree(file)
    os.chdir("../../client")

    # Run the vite build command
    subprocess.run(["npm", "run", "build"])

    os.chdir("../api/static")

    # Create images/users folder if it doesn't exist
    if not os.path.exists("images/users"):
        os.makedirs("images/users")

    # Change the working directory back to the api folder
    os.chdir("../../api")


if __name__ == "__main__":
    build_static()
