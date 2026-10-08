from datetime import datetime
from flask import Blueprint, request, jsonify
from models import db, Rating, BookRequest
from routes.auth_helpers import auth_required, get_current_user

ratings_bp = Blueprint('ratings', __name__)

@ratings_bp.route('', methods=['POST'])
@auth_required()
def create_rating():
    user = get_current_user()
    data = request.get_json() or {}
    
    request_id = data.get('request_id')
    score = data.get('score')
    comment = data.get('comment', '').strip()

    if not request_id:
        return jsonify({'error': 'request_id is required'}), 400

    try:
        score = int(score)
        if score < 1 or score > 5:
            return jsonify({'error': 'Rating score must be between 1 and 5'}), 400
    except (ValueError, TypeError):
        return jsonify({'error': 'Valid rating score between 1 and 5 is required'}), 400

    book_request = BookRequest.query.get(request_id)
    if not book_request:
        return jsonify({'error': 'Request not found'}), 404

    if book_request.status != 'returned':
        return jsonify({'error': 'Ratings can only be submitted for returned books'}), 400

    # Determine participant and target
    if user.id == book_request.requester_id:
        to_user_id = book_request.book.owner_id
    elif user.id == book_request.book.owner_id:
        to_user_id = book_request.requester_id
    else:
        return jsonify({'error': 'You are not a participant in this exchange'}), 403

    existing = Rating.query.filter_by(
        request_id=book_request.id,
        from_user=user.id
    ).first()
    if existing:
        return jsonify({'error': 'You have already rated this transaction'}), 400

    rating = Rating(
        from_user=user.id,
        to_user=to_user_id,
        request_id=book_request.id,
        score=score,
        comment=comment or None,
        created_at=datetime.utcnow()
    )
    db.session.add(rating)
    db.session.commit()

    return jsonify({
        'message': 'Rating submitted successfully',
        'rating': rating.to_dict()
    }), 201
