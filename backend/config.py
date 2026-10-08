import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'bookloop-secret-key-development-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'bookloop-jwt-secret-key-development-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Postgres support with SQLite fallback; converts postgres:// to postgresql://
    raw_db_url = os.environ.get('DATABASE_URL')
    if raw_db_url:
        if raw_db_url.startswith('postgres://'):
            raw_db_url = raw_db_url.replace('postgres://', 'postgresql://', 1)
        SQLALCHEMY_DATABASE_URI = raw_db_url
    else:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'bookloop.db')}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Uploads folder (used when Cloudinary is not configured)
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', os.path.join(BASE_DIR, 'uploads'))
    MAX_CONTENT_LENGTH = 2 * 1024 * 1024  # 2 Megabytes
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

    # Optional Cloudinary storage credentials
    CLOUDINARY_URL = os.environ.get('CLOUDINARY_URL')
    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET')

    # Allowed frontend origin for CORS
    FRONTEND_URL = os.environ.get('FRONTEND_URL')
