import requests
import json

def test_login():
    url = "http://localhost:8000/api/v1/auth/login"
    payload = {
        "email": "test@example.com",
        "password": "wrongpassword"
    }
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Content Type: {response.headers.get('content-type')}")
        try:
            print(f"JSON Response: {response.json()}")
        except:
            print(f"Text Response: {response.text[:200]}")
    except Exception as e:
        print(f"Connection Failed: {e}")

if __name__ == "__main__":
    test_login()
