"""
Create an AAIP admin user.

Run:
    python create_admin.py
"""

import getpass

from app import create_app
from app.services.auth_service import AuthService


def main():
    app = create_app("development")

    with app.app_context():
        print()
        print("=" * 50)
        print("       AAIP ADMIN ACCOUNT CREATION")
        print("=" * 50)
        print()

        email = input("Admin email: ").strip().lower()
        full_name = input("Admin full name: ").strip()

        password = getpass.getpass("Admin password: ")
        confirm_password = getpass.getpass("Confirm password: ")

        if not email:
            print("Error: Email is required.")
            return

        if not full_name:
            print("Error: Full name is required.")
            return

        if len(password) < 8:
            print("Error: Password must be at least 8 characters.")
            return

        if password != confirm_password:
            print("Error: Passwords do not match.")
            return

        try:
            auth_service = AuthService()

            user = auth_service.register(
                email=email,
                password=password,
                full_name=full_name,
                role="admin",
            )

            print()
            print("=" * 50)
            print("ADMIN ACCOUNT CREATED SUCCESSFULLY")
            print("=" * 50)
            print(f"Email : {user['email']}")
            print(f"Name  : {user['full_name']}")
            print(f"Role  : {user['role']}")
            print("=" * 50)

        except ValueError as e:
            print()
            print(f"Error: {e}")


if __name__ == "__main__":
    main()