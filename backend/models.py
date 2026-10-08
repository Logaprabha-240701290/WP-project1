from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    area = db.Column(db.String(100), nullable=True)
    credits = db.Column(db.Integer, default=3, nullable=False)
    role = db.Column(db.String(20), default='user', nullable=False)  # 'user' or 'admin'
    status = db.Column(db.String(20), default='active', nullable=False)  # 'active' or 'blocked'
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    books = db.relationship('Book', backref='owner', lazy=True, cascade='all, delete-orphan')
    requests_made = db.relationship(
        'BookRequest', foreign_keys='BookRequest.requester_id',
        backref='requester', lazy=True, cascade='all, delete-orphan'
    )
    wishlist_items = db.relationship('Wishlist', backref='user', lazy=True, cascade='all, delete-orphan')
    ratings_given = db.relationship(
        'Rating', foreign_keys='Rating.from_user',
        backref='rater', lazy=True, cascade='all, delete-orphan'
    )
    ratings_received = db.relationship(
        'Rating', foreign_keys='Rating.to_user',
        backref='rated_user', lazy=True, cascade='all, delete-orphan'
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_rating_stats(self):
        ratings = Rating.query.filter_by(to_user=self.id).all()
        count = len(ratings)
        avg = round(sum(r.score for r in ratings) / count, 1) if count > 0 else 0.0
        is_trusted = (avg >= 4.0 and count >= 3)
        return {
            'avg_rating': avg,
            'rating_count': count,
            'is_trusted': is_trusted
        }

    def to_dict(self):
        stats = self.get_rating_stats()
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'area': self.area,
            'credits': self.credits,
            'role': self.role,
            'status': self.status,
            'avg_rating': stats['avg_rating'],
            'rating_count': stats['rating_count'],
            'is_trusted': stats['is_trusted'],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def to_public_dict(self):
        stats = self.get_rating_stats()
        return {
            'id': self.id,
            'name': self.name,
            'area': self.area,
            'avg_rating': stats['avg_rating'],
            'rating_count': stats['rating_count'],
            'is_trusted': stats['is_trusted']
        }


class Book(db.Model):
    __tablename__ = 'books'

    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False, index=True)
    author = db.Column(db.String(150), nullable=False, index=True)
    genre = db.Column(db.String(50), nullable=False, index=True)
    condition = db.Column(db.String(50), nullable=False)  # 'New', 'Like New', 'Good', 'Fair'
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(255), nullable=True)
    type = db.Column(db.String(20), default='lend', nullable=False)  # 'lend' or 'exchange'
    status = db.Column(db.String(20), default='available', nullable=False)  # 'available', 'requested', 'borrowed'
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    requests = db.relationship('BookRequest', backref='book', lazy=True, cascade='all, delete-orphan')
    wishlist_entries = db.relationship('Wishlist', backref='book', lazy=True, cascade='all, delete-orphan')

    @property
    def is_overdue(self):
        if self.status == 'borrowed':
            active_req = BookRequest.query.filter_by(
                book_id=self.id, status='accepted'
            ).first()
            if active_req and active_req.due_date and datetime.utcnow() > active_req.due_date:
                return True
        return False

    def to_dict(self, base_url="http://localhost:5000"):
        image_url = f"{base_url}/uploads/{self.image}" if self.image else None
        owner_dict = self.owner.to_public_dict() if self.owner else None
        
        # Check active borrower if borrowed
        borrower_info = None
        due_date_str = None
        active_req = None
        if self.status == 'borrowed':
            active_req = BookRequest.query.filter_by(book_id=self.id, status='accepted').first()
            if active_req:
                due_date_str = active_req.due_date.isoformat() if active_req.due_date else None
                borrower = User.query.get(active_req.requester_id)
                if borrower:
                    borrower_info = {
                        'id': borrower.id,
                        'name': borrower.name,
                        'email': borrower.email,
                        'area': borrower.area
                    }

        return {
            'id': self.id,
            'owner_id': self.owner_id,
            'title': self.title,
            'author': self.author,
            'genre': self.genre,
            'condition': self.condition,
            'description': self.description,
            'image': self.image,
            'image_url': image_url,
            'type': self.type,
            'status': self.status,
            'is_overdue': self.is_overdue,
            'due_date': due_date_str,
            'borrower': borrower_info,
            'owner': owner_dict,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class BookRequest(db.Model):
    __tablename__ = 'book_requests'

    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id', ondelete='CASCADE'), nullable=False)
    requester_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False)  # 'pending', 'accepted', 'rejected', 'returned', 'cancelled'
    request_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    due_date = db.Column(db.DateTime, nullable=True)
    returned_date = db.Column(db.DateTime, nullable=True)

    # Relationships
    ratings = db.relationship('Rating', backref='request', lazy=True, cascade='all, delete-orphan')

    @property
    def is_overdue(self):
        if self.status == 'accepted' and self.due_date and datetime.utcnow() > self.due_date:
            return True
        return False

    def to_dict(self, base_url="http://localhost:5000"):
        book_info = self.book.to_dict(base_url) if self.book else None
        requester_info = self.requester.to_public_dict() if self.requester else None
        owner_info = self.book.owner.to_public_dict() if (self.book and self.book.owner) else None

        # Check existing ratings for this request
        ratings_list = [r.to_dict() for r in self.ratings]

        return {
            'id': self.id,
            'book_id': self.book_id,
            'requester_id': self.requester_id,
            'status': self.status,
            'request_date': self.request_date.isoformat() if self.request_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'returned_date': self.returned_date.isoformat() if self.returned_date else None,
            'is_overdue': self.is_overdue,
            'book': book_info,
            'requester': requester_info,
            'owner': owner_info,
            'ratings': ratings_list
        }


class Wishlist(db.Model):
    __tablename__ = 'wishlists'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id', ondelete='CASCADE'), nullable=False)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'book_id', name='uq_user_book_wishlist'),
    )

    def to_dict(self, base_url="http://localhost:5000"):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'book_id': self.book_id,
            'book': self.book.to_dict(base_url) if self.book else None
        }


class Rating(db.Model):
    __tablename__ = 'ratings'

    id = db.Column(db.Integer, primary_key=True)
    from_user = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    to_user = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    request_id = db.Column(db.Integer, db.ForeignKey('book_requests.id', ondelete='CASCADE'), nullable=False)
    score = db.Column(db.Integer, nullable=False)  # 1 to 5
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('request_id', 'from_user', name='uq_request_from_user_rating'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'from_user': self.from_user,
            'to_user': self.to_user,
            'from_user_name': self.rater.name if self.rater else None,
            'to_user_name': self.rated_user.name if self.rated_user else None,
            'request_id': self.request_id,
            'score': self.score,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'subject': self.subject,
            'message': self.message,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
