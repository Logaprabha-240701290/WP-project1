import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from werkzeug.exceptions import HTTPException

from config import Config
from models import db, User

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure uploads directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    jwt = JWTManager(app)

    # JWT Error handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({'error': 'Missing or invalid authentication token'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({'error': 'Invalid authentication token'}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Authentication token has expired. Please log in again.'}), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has been revoked or user is blocked'}), 401

    # Static uploads route
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'ok', 'app': 'BookLoop API'}), 200

    # Register Blueprints
    from routes.auth import auth_bp
    from routes.books import books_bp
    from routes.requests import requests_bp
    from routes.wishlist import wishlist_bp
    from routes.ratings import ratings_bp
    from routes.profile import profile_bp
    from routes.contact import contact_bp
    from routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(books_bp, url_prefix='/api/books')
    app.register_blueprint(requests_bp, url_prefix='/api/requests')
    app.register_blueprint(wishlist_bp, url_prefix='/api/wishlist')
    app.register_blueprint(ratings_bp, url_prefix='/api/ratings')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(contact_bp, url_prefix='/api/contact')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Global HTTP Error Handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'error': getattr(e, 'description', 'Bad request')}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({'error': 'Unauthorized'}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({'error': getattr(e, 'description', 'Forbidden')}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': getattr(e, 'description', 'Resource not found')}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'error': 'Method not allowed'}), 405

    @app.errorhandler(409)
    def conflict(e):
        return jsonify({'error': getattr(e, 'description', 'Conflict')}), 409

    @app.errorhandler(413)
    def request_entity_too_large(e):
        return jsonify({'error': 'Uploaded file size exceeds the 2MB limit'}), 413

    @app.errorhandler(500)
    def internal_server_error(e):
        return jsonify({'error': 'An internal server error occurred'}), 500

    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        return jsonify({'error': e.description}), e.code

    @app.errorhandler(Exception)
    def handle_unhandled_exception(e):
        # In development, you might log e
        return jsonify({'error': 'An unexpected server error occurred'}), 500

    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
