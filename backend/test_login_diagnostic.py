import requests
import json

def test_login():
    url = "http://localhost:8000/api/v1/auth/login"
    payload = {
        "email": "admin@example.com",
        "password": "Password123!"
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
