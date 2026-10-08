from datetime import datetime
from flask import Blueprint, request, jsonify
from models import db, User, Book, BookRequest
from routes.auth_helpers import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['GET'])
@admin_required()
def get_stats():
    total_users = User.query.filter_by(role='user').count()
    total_books = Book.query.count()
    active_loans = BookRequest.query.filter_by(status='accepted').count()
    completed_exchanges = BookRequest.query.filter_by(status='returned').count()
    pending_requests = BookRequest.query.filter_by(status='pending').count()
    
    # Overdue loans
    now = datetime.utcnow()
    overdue_loans = BookRequest.query.filter(
        BookRequest.status == 'accepted',
        BookRequest.due_date < now
    ).count()

    return jsonify({
        'total_users': total_users,
        'total_books': total_books,
        'active_loans': active_loans,
        'completed_exchanges': completed_exchanges,
        'pending_requests': pending_requests,
        'overdue_loans': overdue_loans
    }), 200


@admin_bp.route('/users', methods=['GET'])
@admin_required()
def get_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200


@admin_bp.route('/users/<int:user_id>/block', methods=['PUT'])
@admin_required()
def block_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.role == 'admin':
        return jsonify({'error': 'Cannot block an administrator account'}), 400

    user.status = 'blocked'
    db.session.commit()
    return jsonify({
        'message': f"User '{user.name}' has been suspended/blocked",
        'user': user.to_dict()
    }), 200


@admin_bp.route('/users/<int:user_id>/unblock', methods=['PUT'])
@admin_required()
def unblock_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user.status = 'active'
    db.session.commit()
    return jsonify({
        'message': f"User '{user.name}' has been unblocked",
        'user': user.to_dict()
    }), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required()
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.role == 'admin':
        return jsonify({'error': 'Cannot delete an administrator account'}), 400

    # Check for active borrowed books
    active_borrows = BookRequest.query.join(Book).filter(
        (BookRequest.requester_id == user.id) | (Book.owner_id == user.id),
        BookRequest.status == 'accepted'
    ).count()

    if active_borrows > 0:
        return jsonify({'error': 'Cannot delete user while they have active book loans in progress'}), 400

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': f"User '{user.name}' deleted successfully"}), 200


@admin_bp.route('/books', methods=['GET'])
@admin_required()
def get_books():
    base_url = request.url_root.rstrip('/')
    books = Book.query.order_by(Book.created_at.desc()).all()
    return jsonify([b.to_dict(base_url) for b in books]), 200


@admin_bp.route('/books/<int:book_id>', methods=['DELETE'])
@admin_required()
def delete_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404

    if book.status == 'borrowed':
        return jsonify({'error': 'Cannot delete a book that is currently borrowed'}), 400

    db.session.delete(book)
    db.session.commit()
    return jsonify({'message': 'Book deleted successfully by administrator'}), 200


@admin_bp.route('/books/<int:book_id>/toggle-availability', methods=['PUT'])
@admin_required()
def toggle_availability(book_id):
    base_url = request.url_root.rstrip('/')
    book = Book.query.get(book_id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404

    if book.status == 'borrowed':
        return jsonify({'error': 'Cannot modify status of a currently borrowed book'}), 400

    if book.status == 'available':
        book.status = 'unavailable'
    else:
        book.status = 'available'

    db.session.commit()
    return jsonify({
        'message': f"Book status updated to {book.status}",
        'book': book.to_dict(base_url)
    }), 200
