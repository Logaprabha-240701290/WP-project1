from flask import Blueprint, jsonify, request
from models import db, Wishlist, Book
from routes.auth_helpers import auth_required, get_current_user

wishlist_bp = Blueprint('wishlist', __name__)

@wishlist_bp.route('', methods=['GET'])
@auth_required()
def get_wishlist():
    base_url = request.url_root.rstrip('/')
    user = get_current_user()
    items = Wishlist.query.filter_by(user_id=user.id).all()
    return jsonify([item.to_dict(base_url) for item in items]), 200


@wishlist_bp.route('/<int:book_id>', methods=['POST'])
@auth_required()
def add_to_wishlist(book_id):
    base_url = request.url_root.rstrip('/')
    user = get_current_user()

    book = Book.query.get(book_id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404

    existing = Wishlist.query.filter_by(user_id=user.id, book_id=book_id).first()
    if existing:
        return jsonify({'error': 'Book is already in your wishlist'}), 400

    item = Wishlist(user_id=user.id, book_id=book_id)
    db.session.add(item)
    db.session.commit()

    return jsonify({
        'message': 'Book added to wishlist',
        'item': item.to_dict(base_url)
    }), 201


@wishlist_bp.route('/<int:book_id>', methods=['DELETE'])
@auth_required()
def remove_from_wishlist(book_id):
    user = get_current_user()
    item = Wishlist.query.filter_by(user_id=user.id, book_id=book_id).first()
    if not item:
        return jsonify({'error': 'Book is not in your wishlist'}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({'message': 'Book removed from wishlist'}), 200
