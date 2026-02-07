import requests
import json

API_URL = 'http://127.0.0.1:8000/api/v1'

def test_chat():
    try:
        resp = requests.post(f"{API_URL}/chat", json={
            'user_id': 'test-user',
            'message': 'hello, please add a task called Test Task'
        })
        print(f"Status Code: {resp.status_code}")
        try:
            print("Response JSON:")
            print(json.dumps(resp.json(), indent=2))
        except:
            print("Response Text:")
            print(resp.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_chat()
