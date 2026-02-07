import requests
import time

# Wait a moment for the server to be ready
time.sleep(1)

try:
    # Test the health endpoint
    response = requests.get('http://127.0.0.1:8001/health', timeout=5)
    print(f"Health check: {response.status_code}")
    print(f"Response: {response.json()}")

    # Test the root endpoint
    response = requests.get('http://127.0.0.1:8001/', timeout=5)
    print(f"Root endpoint: {response.status_code}")
    print(f"Response: {response.json()}")

    print("\nSUCCESS: Backend is running and responding correctly!")

except requests.exceptions.ConnectionError:
    print("ERROR: Could not connect to backend server")
except requests.exceptions.Timeout:
    print("ERROR: Request timed out - server might not be responding")
except Exception as e:
    print(f"ERROR: Error testing backend: {e}")