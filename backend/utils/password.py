"""
Password Utilities for Todo Web App

This module provides functions for password hashing and verification using bcrypt.
"""

import bcrypt
from typing import Union


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: Plain text password to hash

    Returns:
        Hashed password as string
    """
    # Convert password to bytes if it's not already
    if isinstance(password, str):
        password = password.encode('utf-8')

    # Generate salt and hash the password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password, salt)

    # Return as string
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Previously hashed password to compare against

    Returns:
        True if passwords match, False otherwise
    """
    # Convert passwords to bytes if they're not already
    if isinstance(plain_password, str):
        plain_password = plain_password.encode('utf-8')
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')

    # Verify the password
    return bcrypt.checkpw(plain_password, hashed_password)


def is_strong_password(password: str) -> bool:
    """
    Check if a password meets strength requirements.

    Args:
        password: Password to check

    Returns:
        True if password is strong, False otherwise
    """
    # Check length
    if len(password) < 8:
        return False

    # Check for uppercase letter
    has_upper = any(c.isupper() for c in password)

    # Check for lowercase letter
    has_lower = any(c.islower() for c in password)

    # Check for digit
    has_digit = any(c.isdigit() for c in password)

    # Check for special character
    has_special = any(not c.isalnum() for c in password)

    return has_upper and has_lower and has_digit and has_special


# Example usage and testing
if __name__ == "__main__":
    # Test the functions
    test_password = "TestPass123!"

    print(f"Original password: {test_password}")
    print(f"Is strong password: {is_strong_password(test_password)}")

    hashed = hash_password(test_password)
    print(f"Hashed password: {hashed}")

    verified = verify_password(test_password, hashed)
    print(f"Verification result: {verified}")

    # Test with wrong password
    wrong_verified = verify_password("WrongPass456@", hashed)
    print(f"Wrong password verification: {wrong_verified}")