import os
import sys
import json

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app import create_app
from models import db, User, Book, BookRequest

def run_tests():
    app = create_app()
    client = app.test_client()
    passed_count = 0
    total_count = 8

    def log_result(step_num, title, success, detail=""):
        nonlocal passed_count
        if success:
            passed_count += 1
            print(f"[PASS] Step {step_num}: {title}")
        else:
            print(f"[FAIL] Step {step_num}: {title} - {detail}")

    with app.app_context():
        # Ensure clean state for test users
        existing_test_user = User.query.filter_by(email="flow_tester@example.com").first()
        if existing_test_user:
            db.session.delete(existing_test_user)
            db.session.commit()

        # Step 1: Register
        reg_payload = {
            "name": "Flow Tester",
            "email": "flow_tester@example.com",
            "password": "Password@123",
            "phone": "9800011122",
            "area": "Test Wing"
        }
        res = client.post('/api/auth/register', json=reg_payload)
        data = res.get_json() or {}
        step1_ok = (res.status_code == 201 and "token" in data and data.get("user", {}).get("credits") == 3)
        log_result(1, "Register new user with 3 initial credits", step1_ok, f"Status: {res.status_code}, Resp: {data}")
        tester_token = data.get("token")
        tester_id = data.get("user", {}).get("id")

        # Step 2: Login
        login_payload = {
            "email": "flow_tester@example.com",
            "password": "Password@123"
        }
        res = client.post('/api/auth/login', json=login_payload)
        data = res.get_json() or {}
        step2_ok = (res.status_code == 200 and "token" in data)
        log_result(2, "Login as newly registered user", step2_ok, f"Status: {res.status_code}")
        tester_token = data.get("token")

        # Step 3: Add Book
        book_payload = {
            "title": "Automated Testing in Python",
            "author": "Guido van Rossum",
            "genre": "Technology",
            "condition": "New",
            "description": "A guide to comprehensive testing.",
            "type": "lend"
        }
        res = client.post('/api/books', json=book_payload, headers={"Authorization": f"Bearer {tester_token}"})
        data = res.get_json() or {}
        step3_ok = (res.status_code == 201 and "book" in data and data["book"]["status"] == "available")
        log_result(3, "Add book as owner", step3_ok, f"Status: {res.status_code}, Resp: {data}")
        book_id = data.get("book", {}).get("id")

        # Step 4: Login as another user (Rahul) and request the book
        res = client.post('/api/auth/login', json={"email": "rahul@example.com", "password": "Password@123"})
        rahul_token = res.get_json().get("token")
        rahul_initial_credits = res.get_json().get("user", {}).get("credits")

        res = client.post('/api/requests', json={"book_id": book_id}, headers={"Authorization": f"Bearer {rahul_token}"})
        data = res.get_json() or {}
        step4_ok = (res.status_code == 201 and data.get("request", {}).get("status") == "pending")
        log_result(4, "Request book as borrower", step4_ok, f"Status: {res.status_code}, Resp: {data}")
        request_id = data.get("request", {}).get("id")

        # Step 5: Owner accepts request
        res = client.put(f'/api/requests/{request_id}/accept', headers={"Authorization": f"Bearer {tester_token}"})
        data = res.get_json() or {}
        # verify borrower lost 1 credit
        rahul_user = User.query.filter_by(email="rahul@example.com").first()
        step5_ok = (
            res.status_code == 200 and
            data.get("request", {}).get("status") == "accepted" and
            rahul_user.credits == rahul_initial_credits - 1
        )
        log_result(5, "Accept request (deduct 1 credit from borrower & book borrowed)", step5_ok, f"Status: {res.status_code}, Resp: {data}")

        # Step 6: Owner marks book returned
        owner_before = User.query.get(tester_id)
        owner_before_credits = owner_before.credits

        res = client.put(f'/api/requests/{request_id}/return', headers={"Authorization": f"Bearer {tester_token}"})
        data = res.get_json() or {}
        owner_after = User.query.get(tester_id)
        step6_ok = (
            res.status_code == 200 and
            data.get("request", {}).get("status") == "returned" and
            owner_after.credits == owner_before_credits + 1
        )
        log_result(6, "Return book (owner awarded +1 credit & book available)", step6_ok, f"Status: {res.status_code}, Resp: {data}")

        # Step 7: Rate user
        rate_payload = {
            "request_id": request_id,
            "score": 5,
            "comment": "Super fast response and smooth handoff!"
        }
        res = client.post('/api/ratings', json=rate_payload, headers={"Authorization": f"Bearer {rahul_token}"})
        data = res.get_json() or {}
        step7_ok = (res.status_code == 201 and data.get("rating", {}).get("score") == 5)
        log_result(7, "Submit rating for returned book exchange", step7_ok, f"Status: {res.status_code}, Resp: {data}")

        # Step 8: Admin block user and token invalidation
        # Login as Admin
        res = client.post('/api/auth/login', json={"email": "admin@bookloop.com", "password": "Admin@123"})
        admin_token = res.get_json().get("token")

        # Block tester
        res = client.put(f'/api/admin/users/{tester_id}/block', headers={"Authorization": f"Bearer {admin_token}"})
        block_ok = (res.status_code == 200)

        # Attempt to use blocked tester's token
        res_me = client.get('/api/auth/me', headers={"Authorization": f"Bearer {tester_token}"})
        blocked_token_rejected = (res_me.status_code in [401, 403])

        step8_ok = block_ok and blocked_token_rejected
        log_result(8, "Admin block user and verify blocked token stops working immediately", step8_ok, f"Block Status: {res.status_code}, Me Status: {res_me.status_code}")

        print("=" * 60)
        print(f"Results: {passed_count}/{total_count} steps passed.")
        if passed_count == total_count:
            print("[SUCCESS] All test flow steps PASSED flawlessly!")
            return True
        else:
            print("[FAILURE] Some test steps failed. Review logs above.")
            return False

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
