from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from models import db, Book, BookRequest, User
from routes.auth_helpers import auth_required, get_current_user

requests_bp = Blueprint('requests', __name__)

@requests_bp.route('', methods=['POST'])
@auth_required()
def create_request():
    base_url = request.url_root.rstrip('/')
    user = get_current_user()
    data = request.get_json() or {}
    book_id = data.get('book_id')

    if not book_id:
        return jsonify({'error': 'book_id is required'}), 400

    book = Book.query.get(book_id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404

    if book.owner_id == user.id:
        return jsonify({'error': 'You cannot request your own book'}), 400

    if user.credits <= 0:
        return jsonify({'error': 'You do not have enough credits to request a book (minimum 1 credit required)'}), 400

    if book.status == 'borrowed':
        return jsonify({'error': 'This book is currently borrowed by another user'}), 400

    # Check duplicate pending request
    existing = BookRequest.query.filter_by(
        book_id=book.id,
        requester_id=user.id,
        status='pending'
    ).first()
    if existing:
        return jsonify({'error': 'You already have an active pending request for this book'}), 400

    req = BookRequest(
        book_id=book.id,
        requester_id=user.id,
        status='pending',
        request_date=datetime.utcnow()
    )
    if book.status == 'available':
        book.status = 'requested'

    db.session.add(req)
    db.session.commit()

    return jsonify({
        'message': 'Book request submitted successfully',
        'request': req.to_dict(base_url)
    }), 201


@requests_bp.route('/received', methods=['GET'])
@auth_required()
def get_received_requests():
    base_url = request.url_root.rstrip('/')
    user = get_current_user()
    
    # All requests for books owned by current user
    requests_list = BookRequest.query.join(Book).filter(
        Book.owner_id == user.id
    ).order_by(BookRequest.request_date.desc()).all()

    return jsonify([r.to_dict(base_url) for r in requests_list]), 200


@requests_bp.route('/sent', methods=['GET'])
@auth_required()
def get_sent_requests():
    base_url = request.url_root.rstrip('/')
    user = get_current_user()

    requests_list = BookRequest.query.filter_by(
        requester_id=user.id
    ).order_by(BookRequest.request_date.desc()).all()

    return jsonify([r.to_dict(base_url) for r in requests_list]), 200


@requests_bp.route('/history', methods=['GET'])
@auth_required()
def get_request_history():
    base_url = request.url_root.rstrip('/')
    user = get_current_user()

    # Requests where user is requester or owner
    requests_list = BookRequest.query.join(Book).filter(
        (BookRequest.requester_id == user.id) | (Book.owner_id == user.id)
    ).order_by(BookRequest.request_date.desc()).all()

    return jsonify([r.to_dict(base_url) for r in requests_list]), 200


@requests_bp.route('/<int:request_id>/accept', methods=['PUT'])
@auth_required()
def accept_request(request_id):
    base_url = request.url_root.rstrip('/')
    user = get_current_user()
    req = BookRequest.query.get(request_id)

    if not req:
        return jsonify({'error': 'Request not found'}), 404

    if req.book.owner_id != user.id:
        return jsonify({'error': 'Only the book owner can accept this request'}), 403

    if req.status != 'pending':
        return jsonify({'error': f'Request is not pending (status: {req.status})'}), 400

    # Re-check borrower's credits
    borrower = User.query.get(req.requester_id)
    if not borrower or borrower.credits <= 0:
        return jsonify({'error': 'Borrower has 0 credits. Request cannot be accepted.'}), 400

    # Deduct 1 credit from borrower
    borrower.credits -= 1

    # Update request
    req.status = 'accepted'
    req.due_date = datetime.utcnow() + timedelta(days=14)
    req.book.status = 'borrowed'

    # Auto-reject other pending requests for this book
    other_requests = BookRequest.query.filter(
        BookRequest.book_id == req.book_id,
        BookRequest.id != req.id,
        BookRequest.status == 'pending'
    ).all()
    for other in other_requests:
        other.status = 'rejected'

    db.session.commit()

    return jsonify({
        'message': 'Request accepted! 1 credit deducted from borrower. Due in 14 days.',
        'request': req.to_dict(base_url)
    }), 200


@requests_bp.route('/<int:request_id>/reject', methods=['PUT'])
@auth_required()
def reject_request(request_id):
    base_url = request.url_root.rstrip('/')
    user = get_current_user()
    req = BookRequest.query.get(request_id)

    if not req:
        return jsonify({'error': 'Request not found'}), 404

    if req.book.owner_id != user.id and user.role != 'admin':
        return jsonify({'error': 'Only the book owner can reject this request'}), 403

    if req.status != 'pending':
        return jsonify({'error': f'Cannot reject request with status: {req.status}'}), 400

    req.status = 'rejected'

    # Check if there are remaining pending requests for this book
    remaining_pending = BookRequest.query.filter(
        BookRequest.book_id == req.book_id,
        BookRequest.id != req.id,
        BookRequest.status == 'pending'
    ).count()

    if remaining_pending == 0 and req.book.status == 'requested':
        req.book.status = 'available'

    db.session.commit()

    return jsonify({
        'message': 'Request rejected',
        'request': req.to_dict(base_url)
    }), 200


@requests_bp.route('/<int:request_id>/cancel', methods=['PUT'])
@auth_required()
def cancel_request(request_id):
    base_url = request.url_root.rstrip('/')
    user = get_current_user()
    req = BookRequest.query.get(request_id)

    if not req:
        return jsonify({'error': 'Request not found'}), 404

    if req.requester_id != user.id and user.role != 'admin':
        return jsonify({'error': 'You can only cancel your own requests'}), 403

    if req.status != 'pending':
        return jsonify({'error': f'Cannot cancel request with status: {req.status}'}), 400

    req.status = 'cancelled'

    # Check remaining pending requests
    remaining_pending = BookRequest.query.filter(
        BookRequest.book_id == req.book_id,
        BookRequest.id != req.id,
        BookRequest.status == 'pending'
    ).count()

    if remaining_pending == 0 and req.book.status == 'requested':
        req.book.status = 'available'

    db.session.commit()

    return jsonify({
        'message': 'Request cancelled successfully',
        'request': req.to_dict(base_url)
    }), 200


@requests_bp.route('/<int:request_id>/return', methods=['PUT'])
@auth_required()
def return_request(request_id):
    base_url = request.url_root.rstrip('/')
    user = get_current_user()
    req = BookRequest.query.get(request_id)

    if not req:
        return jsonify({'error': 'Request not found'}), 404

    if req.book.owner_id != user.id and user.role != 'admin':
        return jsonify({'error': 'Only the book owner can mark the book as returned'}), 403

    if req.status != 'accepted':
        return jsonify({'error': f'Cannot return book with request status: {req.status}'}), 400

    req.status = 'returned'
    req.returned_date = datetime.utcnow()
    req.book.status = 'available'

    # Add 1 credit to lender
    lender = User.query.get(req.book.owner_id)
    if lender:
        lender.credits += 1

    db.session.commit()

    return jsonify({
        'message': 'Book returned successfully! 1 credit awarded to lender.',
        'request': req.to_dict(base_url)
    }), 200
