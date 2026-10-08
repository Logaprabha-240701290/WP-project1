import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models import db, User
from routes.auth_helpers import auth_required, get_current_user

auth_bp = Blueprint('auth', __name__)

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    phone = data.get('phone', '').strip() or None
    area = data.get('area', '').strip() or None

    if not name:
        return jsonify({'error': 'Name is required'}), 400
    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({'error': 'Valid email is required'}), 400
    if not password or len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'An account with this email already exists'}), 409

    user = User(
        name=name,
        email=email,
        phone=phone,
        area=area,
        credits=3,
        role='user',
        status='active'
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Registration successful! You have been awarded 3 credits.',
        'token': token,
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if user.status == 'blocked':
        return jsonify({'error': 'Your account has been suspended/blocked. Please contact support.'}), 403

    token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@auth_required()
def get_me():
    user = get_current_user()
    return jsonify({'user': user.to_dict()}), 200
