import os

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) #get the directory of the backend folder
UPLOADS_FOLDER = os.path.join(BACKEND_DIR, "uploads") #join the backend directory with the uploads folder
THUMBNAILS_FOLDER = os.path.join(UPLOADS_FOLDER, "thumbnails") #join the uploads folder with the thumbnails folder

RATIO_SIZES = {
    "16:9": (1280, 720),
    "1:1": (1024, 1024),
    "9:16": (720, 1280),
}


def ensure_upload_dirs():
    os.makedirs(THUMBNAILS_FOLDER, exist_ok=True)
