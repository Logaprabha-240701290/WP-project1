import re
from flask import Blueprint, request, jsonify
from models import db, Message

contact_bp = Blueprint('contact', __name__)
EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

@contact_bp.route('', methods=['POST'])
def submit_contact():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    subject = data.get('subject', '').strip()
    message = data.get('message', '').strip()

    if not name:
        return jsonify({'error': 'Name is required'}), 400
    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({'error': 'Valid email is required'}), 400
    if not subject:
        return jsonify({'error': 'Subject is required'}), 400
    if not message:
        return jsonify({'error': 'Message content is required'}), 400

    new_msg = Message(
        name=name,
        email=email,
        subject=subject,
        message=message
    )
    db.session.add(new_msg)
    db.session.commit()

    return jsonify({
        'message': 'Thank you for reaching out! Your message has been received.',
        'contact': new_msg.to_dict()
    }), 201
