import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'bookloop-secret-key-development-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'bookloop-jwt-secret-key-development-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', f"sqlite:///{os.path.join(BASE_DIR, 'bookloop.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    MAX_CONTENT_LENGTH = 2 * 1024 * 1024  # 2 Megabytes
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
