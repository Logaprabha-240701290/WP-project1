import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from models import db, Book, BookRequest
from routes.auth_helpers import auth_required, get_current_user, allowed_file

books_bp = Blueprint('books', __name__)

def save_book_image(image_file):
    """Save image to Cloudinary if configured; otherwise save to local filesystem."""
    has_cloudinary = bool(
        current_app.config.get('CLOUDINARY_URL') or
        (current_app.config.get('CLOUDINARY_CLOUD_NAME') and
         current_app.config.get('CLOUDINARY_API_KEY') and
         current_app.config.get('CLOUDINARY_API_SECRET'))
    )
    if has_cloudinary:
        try:
            import cloudinary
            import cloudinary.uploader
            if current_app.config.get('CLOUDINARY_CLOUD_NAME'):
                cloudinary.config(
                    cloud_name=current_app.config.get('CLOUDINARY_CLOUD_NAME'),
                    api_key=current_app.config.get('CLOUDINARY_API_KEY'),
                    api_secret=current_app.config.get('CLOUDINARY_API_SECRET'),
                    secure=True
                )
            result = cloudinary.uploader.upload(
                image_file,
                folder="bookloop_covers",
                resource_type="image"
            )
            return result.get('secure_url')
        except Exception as e:
            current_app.logger.error(f"Cloudinary upload error: {e}")

    # Fallback to local storage
    ext = image_file.filename.rsplit('.', 1)[1].lower()
    image_filename = f"{uuid.uuid4().hex}.{ext}"
    try:
        os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
        image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_filename)
        image_file.save(image_path)
    except OSError:
        pass
    return image_filename

def remove_book_image(image_ref):
    """Safely remove local image file if not an external URL."""
    if not image_ref:
        return
    if not (image_ref.startswith('http://') or image_ref.startswith('https://')):
        img_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_ref)
        if os.path.exists(img_path):
            try:
                os.remove(img_path)
            except OSError:
                pass

@books_bp.route('', methods=['GET'])
def get_books():
    base_url = request.url_root.rstrip('/')
    search = request.args.get('search', '').strip()
    genre = request.args.get('genre', '').strip()
    book_type = request.args.get('type', '').strip()
    status = request.args.get('status', '').strip()
    
    try:
        page = int(request.args.get('page', 1))
        if page < 1:
            page = 1
    except ValueError:
        page = 1

    try:
        per_page = int(request.args.get('per_page', 9))
        if per_page < 1 or per_page > 50:
            per_page = 9
    except ValueError:
        per_page = 9

    query = Book.query

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Book.title.ilike(search_filter)) |
            (Book.author.ilike(search_filter)) |
            (Book.description.ilike(search_filter))
        )
    if genre and genre.lower() != 'all':
        query = query.filter(Book.genre.ilike(genre))
    if book_type and book_type.lower() != 'all':
        query = query.filter(Book.type == book_type.lower())
    if status and status.lower() != 'all':
        query = query.filter(Book.status == status.lower())

    query = query.order_by(Book.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'items': [b.to_dict(base_url) for b in pagination.items],
        'page': pagination.page,
        'per_page': pagination.per_page,
        'total': pagination.total,
        'pages': pagination.pages or 1
    }), 200


@books_bp.route('/featured', methods=['GET'])
def get_featured_books():
    base_url = request.url_root.rstrip('/')
    books = Book.query.filter_by(status='available').order_by(Book.created_at.desc()).limit(6).all()
    # If fewer than 6 available books, fill up with recent books
    if len(books) < 6:
        books = Book.query.order_by(Book.created_at.desc()).limit(6).all()
    return jsonify([b.to_dict(base_url) for b in books]), 200


@books_bp.route('/mine', methods=['GET'])
@auth_required()
def get_my_books():
    base_url = request.url_root.rstrip('/')
    user = get_current_user()
    books = Book.query.filter_by(owner_id=user.id).order_by(Book.created_at.desc()).all()
    return jsonify([b.to_dict(base_url) for b in books]), 200


@books_bp.route('/<int:book_id>', methods=['GET'])
def get_book(book_id):
    base_url = request.url_root.rstrip('/')
    book = Book.query.get(book_id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404
    return jsonify(book.to_dict(base_url)), 200


@books_bp.route('', methods=['POST'])
@auth_required()
def add_book():
    base_url = request.url_root.rstrip('/')
    user = get_current_user()

    # Form or JSON
    if request.is_json:
        data = request.get_json() or {}
        image_identifier = None
    else:
        data = request.form.to_dict()
        image_file = request.files.get('image')
        image_identifier = None
        if image_file and image_file.filename:
            if not allowed_file(image_file.filename):
                return jsonify({'error': 'Invalid image format. Allowed: jpg, jpeg, png, webp'}), 400
            image_identifier = save_book_image(image_file)

    title = data.get('title', '').strip()
    author = data.get('author', '').strip()
    genre = data.get('genre', '').strip()
    condition = data.get('condition', '').strip()
    description = data.get('description', '').strip()
    book_type = data.get('type', 'lend').strip().lower()

    if not title:
        return jsonify({'error': 'Title is required'}), 400
    if not author:
        return jsonify({'error': 'Author is required'}), 400
    if not genre:
        return jsonify({'error': 'Genre is required'}), 400
    if not condition:
        return jsonify({'error': 'Condition is required'}), 400
    if book_type not in ['lend', 'exchange']:
        book_type = 'lend'

    new_book = Book(
        owner_id=user.id,
        title=title,
        author=author,
        genre=genre,
        condition=condition,
        description=description or None,
        image=image_identifier,
        type=book_type,
        status='available'
    )
    db.session.add(new_book)
    db.session.commit()

    return jsonify({
        'message': 'Book added successfully',
        'book': new_book.to_dict(base_url)
    }), 201


@books_bp.route('/<int:book_id>', methods=['PUT'])
@auth_required()
def update_book(book_id):
    base_url = request.url_root.rstrip('/')
    user = get_current_user()
    book = Book.query.get(book_id)

    if not book:
        return jsonify({'error': 'Book not found'}), 404

    if book.owner_id != user.id and user.role != 'admin':
        return jsonify({'error': 'You do not have permission to edit this book'}), 403

    if request.is_json:
        data = request.get_json() or {}
    else:
        data = request.form.to_dict()
        image_file = request.files.get('image')
        if image_file and image_file.filename:
            if not allowed_file(image_file.filename):
                return jsonify({'error': 'Invalid image format. Allowed: jpg, jpeg, png, webp'}), 400
            
            # Remove previous local image if applicable
            remove_book_image(book.image)
            book.image = save_book_image(image_file)

    if 'title' in data and data['title'].strip():
        book.title = data['title'].strip()
    if 'author' in data and data['author'].strip():
        book.author = data['author'].strip()
    if 'genre' in data and data['genre'].strip():
        book.genre = data['genre'].strip()
    if 'condition' in data and data['condition'].strip():
        book.condition = data['condition'].strip()
    if 'description' in data:
        book.description = data['description'].strip() or None
    if 'type' in data and data['type'].strip().lower() in ['lend', 'exchange']:
        book.type = data['type'].strip().lower()

    db.session.commit()
    return jsonify({
        'message': 'Book updated successfully',
        'book': book.to_dict(base_url)
    }), 200


@books_bp.route('/<int:book_id>', methods=['DELETE'])
@auth_required()
def delete_book(book_id):
    user = get_current_user()
    book = Book.query.get(book_id)

    if not book:
        return jsonify({'error': 'Book not found'}), 404

    if book.owner_id != user.id and user.role != 'admin':
        return jsonify({'error': 'You do not have permission to delete this book'}), 403

    if book.status == 'borrowed':
        return jsonify({'error': 'Cannot delete a book that is currently borrowed'}), 400

    # Delete local image file if applicable
    remove_book_image(book.image)

    db.session.delete(book)
    db.session.commit()
    return jsonify({'message': 'Book deleted successfully'}), 200
