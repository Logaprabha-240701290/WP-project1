from flask import Blueprint, request, jsonify
from models import db
from routes.auth_helpers import auth_required, get_current_user

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('', methods=['GET'])
@auth_required()
def get_profile():
    user = get_current_user()
    return jsonify({'user': user.to_dict()}), 200


@profile_bp.route('', methods=['PUT'])
@auth_required()
def update_profile():
    user = get_current_user()
    data = request.get_json() or {}

    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()
    area = data.get('area', '').strip()

    if name:
        user.name = name
    if phone is not None:
        user.phone = phone or None
    if area is not None:
        user.area = area or None

    db.session.commit()
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200


@profile_bp.route('/password', methods=['PUT'])
@auth_required()
def change_password():
    user = get_current_user()
    data = request.get_json() or {}

    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_password or not new_password:
        return jsonify({'error': 'Current and new password are required'}), 400

    if not user.check_password(current_password):
        return jsonify({'error': 'Incorrect current password'}), 400

    if len(new_password) < 8:
        return jsonify({'error': 'New password must be at least 8 characters long'}), 400

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'message': 'Password updated successfully'}), 200
