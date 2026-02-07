
import requests

url = "http://localhost:8000/api/v1/auth/register"
payload = {
    "email": "admin@example.com",
    "password": "Password123!",
    "first_name": "Admin",
    "last_name": "User"
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 201:
        print("SUCCESS: User created successfully.")
    elif response.status_code == 400 and "already registered" in response.text:
        print("SUCCESS: User already exists.")
    else:
        print(f"FAILED: {response.status_code} - {response.text}")
except Exception as e:
    print(f"ERROR: {e}")
