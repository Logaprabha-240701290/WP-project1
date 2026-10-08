from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User

def get_current_user():
    identity = get_jwt_identity()
    if not identity:
        return None
    try:
        user_id = int(identity)
        user = User.query.get(user_id)
        if user and user.status == 'active':
            return user
    except (ValueError, TypeError):
        return None
    return None

def auth_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({"error": "Unauthorized or account is blocked"}), 401
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({"error": "Unauthorized or account is blocked"}), 401
            if user.role != 'admin':
                return jsonify({"error": "Admin privileges required"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'jpg', 'jpeg', 'png', 'webp'}
