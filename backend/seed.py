import os
import sys
from datetime import datetime, timedelta

# Ensure backend root is on sys.path
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app import create_app
from models import db, User, Book, BookRequest, Wishlist, Rating, Message

def seed_database():
    app = create_app()
    with app.app_context():
        print("[INFO] Seeding database...")

        # Ensure upload folder exists
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

        # Clear existing tables safely (reverse order of foreign keys)
        Rating.query.delete()
        Wishlist.query.delete()
        BookRequest.query.delete()
        Book.query.delete()
        Message.query.delete()
        User.query.delete()
        db.session.commit()
        print("[OK] Cleared existing database tables.")

        # 1. Create Admin
        admin = User(
            name="System Administrator",
            email="admin@bookloop.com",
            phone="9876543210",
            area="Campus Admin Center",
            credits=10,
            role="admin",
            status="active"
        )
        admin.set_password("Admin@123")
        db.session.add(admin)

        # 2. Create 5 Users
        user_data = [
            {
                "name": "Rahul Sharma",
                "email": "rahul@example.com",
                "phone": "9811122233",
                "area": "Hostel 4, North Block",
                "credits": 4
            },
            {
                "name": "Priya Patel",
                "email": "priya@example.com",
                "phone": "9822233344",
                "area": "Sector 15, South Campus",
                "credits": 5
            },
            {
                "name": "Amit Verma",
                "email": "amit@example.com",
                "phone": "9833344455",
                "area": "Engineering Quadrangle",
                "credits": 3
            },
            {
                "name": "Sneha Nair",
                "email": "sneha@example.com",
                "phone": "9844455566",
                "area": "Green Glen Apartments",
                "credits": 3
            },
            {
                "name": "Vikram Rao",
                "email": "vikram@example.com",
                "phone": "9855566677",
                "area": "West Avenue, Block B",
                "credits": 2
            }
        ]

        users = {}
        for ud in user_data:
            u = User(
                name=ud["name"],
                email=ud["email"],
                phone=ud["phone"],
                area=ud["area"],
                credits=ud["credits"],
                role="user",
                status="active"
            )
            u.set_password("Password@123")
            db.session.add(u)
            users[ud["email"]] = u

        db.session.commit()
        print("[OK] Created admin and 5 sample users.")

        # 3. Create 15 Books across genres
        book_definitions = [
            # Rahul's books (3)
            (users["rahul@example.com"].id, "Clean Code", "Robert C. Martin", "Technology", "Good",
             "A Handbook of Agile Software Craftsmanship. Essential reading for every developer.", "lend", "borrowed"),
            (users["rahul@example.com"].id, "To Kill a Mockingbird", "Harper Lee", "Fiction", "Like New",
             "A timeless masterpiece exploring courage, empathy, and justice in the American South.", "exchange", "available"),
            (users["rahul@example.com"].id, "Project Hail Mary", "Andy Weir", "Science", "New",
             "A lone astronaut must save the earth from disaster in this exhilarating sci-fi adventure.", "exchange", "available"),

            # Priya's books (3)
            (users["priya@example.com"].id, "The Pragmatic Programmer", "Andrew Hunt, David Thomas", "Technology", "Like New",
             "Your journey to mastery. Great tips on software engineering, debugging, and career growth.", "lend", "requested"),
            (users["priya@example.com"].id, "Atomic Habits", "James Clear", "Self-Help", "New",
             "An easy and proven way to build good habits and break bad ones.", "lend", "borrowed"),
            (users["priya@example.com"].id, "1984", "George Orwell", "Fiction", "Good",
             "Classic dystopian novel depicting a totalitarian regime and omnipresent surveillance.", "exchange", "available"),

            # Amit's books (3)
            (users["amit@example.com"].id, "Introduction to Algorithms (CLRS)", "Thomas H. Cormen", "Technology", "Fair",
             "Comprehensive textbook covering foundational and advanced algorithms and data structures.", "lend", "available"),
            (users["amit@example.com"].id, "Sapiens: A Brief History of Humankind", "Yuval Noah Harari", "Non-Fiction", "Like New",
             "Surveys the history of humankind from the Stone Age up to the twenty-first century.", "lend", "available"),
            (users["amit@example.com"].id, "The Silent Patient", "Alex Michaelides", "Mystery", "Good",
             "A gripping psychological thriller about a woman's act of violence against her husband.", "exchange", "available"),

            # Sneha's books (3)
            (users["sneha@example.com"].id, "Dune", "Frank Herbert", "Fantasy", "Like New",
             "Set on the desert planet Arrakis, a monumental story of politics, religion, and power.", "lend", "available"),
            (users["sneha@example.com"].id, "Thinking, Fast and Slow", "Daniel Kahneman", "Economics", "Good",
             "Explains the two systems that drive the way humans think and make economic choices.", "lend", "available"),
            (users["sneha@example.com"].id, "Steve Jobs", "Walter Isaacson", "Biography", "Good",
             "The exclusive biography of the creative entrepreneur whose passion revolutionized tech.", "exchange", "available"),

            # Vikram's books (3)
            (users["vikram@example.com"].id, "A Brief History of Time", "Stephen Hawking", "Science", "Like New",
             "From the Big Bang to black holes, a landmark book on physics and the universe.", "lend", "available"),
            (users["vikram@example.com"].id, "Design Patterns", "Gang of Four", "Technology", "Fair",
             "Elements of Reusable Object-Oriented Software. The classic software design pattern catalog.", "lend", "available"),
            (users["vikram@example.com"].id, "Deep Work", "Cal Newport", "Self-Help", "Like New",
             "Rules for focused success in a distracted world. Master difficult information quickly.", "lend", "available")
        ]

        books = []
        for owner_id, title, author, genre, cond, desc, btype, status in book_definitions:
            b = Book(
                owner_id=owner_id,
                title=title,
                author=author,
                genre=genre,
                condition=cond,
                description=desc,
                image=None,
                type=btype,
                status=status
            )
            db.session.add(b)
            books.append(b)

        db.session.commit()
        print(f"[OK] Inserted {len(books)} books across varied genres.")

        # 4. Create requests:
        now = datetime.utcnow()

        # Overdue loan: Vikram borrowed "Clean Code" from Rahul (due 3 days ago)
        clean_code = books[0]
        req_overdue = BookRequest(
            book_id=clean_code.id,
            requester_id=users["vikram@example.com"].id,
            status="accepted",
            request_date=now - timedelta(days=17),
            due_date=now - timedelta(days=3)
        )
        db.session.add(req_overdue)

        # Active normal loan: Amit borrowed "Atomic Habits" from Priya (due in 10 days)
        atomic_habits = books[4]
        req_active = BookRequest(
            book_id=atomic_habits.id,
            requester_id=users["amit@example.com"].id,
            status="accepted",
            request_date=now - timedelta(days=4),
            due_date=now + timedelta(days=10)
        )
        db.session.add(req_active)

        # Pending request: Sneha requested "The Pragmatic Programmer" from Priya
        pragmatic = books[3]
        req_pending = BookRequest(
            book_id=pragmatic.id,
            requester_id=users["sneha@example.com"].id,
            status="pending",
            request_date=now - timedelta(hours=5)
        )
        db.session.add(req_pending)

        # 3 Completed (returned) requests involving Priya so Priya gets Trusted User badge
        # (needs average >= 4.0 with at least 3 ratings)
        # We'll use 1984, Sapiens, To Kill a Mockingbird
        req_ret1 = BookRequest(
            book_id=books[5].id,  # 1984 owned by Priya
            requester_id=users["rahul@example.com"].id,
            status="returned",
            request_date=now - timedelta(days=30),
            due_date=now - timedelta(days=16),
            returned_date=now - timedelta(days=18)
        )
        db.session.add(req_ret1)

        req_ret2 = BookRequest(
            book_id=books[5].id,  # 1984 owned by Priya
            requester_id=users["amit@example.com"].id,
            status="returned",
            request_date=now - timedelta(days=45),
            due_date=now - timedelta(days=31),
            returned_date=now - timedelta(days=32)
        )
        db.session.add(req_ret2)

        req_ret3 = BookRequest(
            book_id=books[3].id,  # The Pragmatic Programmer owned by Priya
            requester_id=users["sneha@example.com"].id,
            status="returned",
            request_date=now - timedelta(days=60),
            due_date=now - timedelta(days=46),
            returned_date=now - timedelta(days=48)
        )
        db.session.add(req_ret3)

        db.session.commit()
        print("[OK] Created sample book requests (including overdue and returned loans).")

        # 5. Insert Ratings for Priya (from Rahul, Amit, Sneha)
        rating1 = Rating(
            from_user=users["rahul@example.com"].id,
            to_user=users["priya@example.com"].id,
            request_id=req_ret1.id,
            score=5,
            comment="Excellent lender! Book was in mint condition and handoff was prompt."
        )
        rating2 = Rating(
            from_user=users["amit@example.com"].id,
            to_user=users["priya@example.com"].id,
            request_id=req_ret2.id,
            score=5,
            comment="Very friendly and professional exchange. Highly recommended!"
        )
        rating3 = Rating(
            from_user=users["sneha@example.com"].id,
            to_user=users["priya@example.com"].id,
            request_id=req_ret3.id,
            score=4,
            comment="Great experience, book was clean with no missing pages."
        )
        db.session.add_all([rating1, rating2, rating3])

        # 6. Sample Wishlist items
        w1 = Wishlist(user_id=users["rahul@example.com"].id, book_id=books[3].id)
        w2 = Wishlist(user_id=users["rahul@example.com"].id, book_id=books[9].id)
        w3 = Wishlist(user_id=users["priya@example.com"].id, book_id=books[0].id)
        db.session.add_all([w1, w2, w3])

        # 7. Sample Contact message
        msg1 = Message(
            name="John Doe",
            email="johndoe@university.edu",
            subject="Question regarding book exchange policy",
            message="Hi BookLoop team, I would like to know if we can donate books directly to the platform pool. Thanks!"
        )
        db.session.add(msg1)

        db.session.commit()

        # Check Priya's rating badge
        priya_stats = users["priya@example.com"].get_rating_stats()
        print(f"[OK] Priya Patel rating stats: avg={priya_stats['avg_rating']}, count={priya_stats['rating_count']}, is_trusted={priya_stats['is_trusted']}")
        print("[SUCCESS] Database seeded successfully!")

if __name__ == '__main__':
    seed_database()
