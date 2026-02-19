import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()

async def verify_everything():
    api_key = os.getenv("OPENAI_API_KEY")
    print(f"--- FINAL VERIFICATION FOR KEY: {api_key[:12]}... ---")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Final Verification",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        # Test Chat Completion with Gemma 3
        print("\nTesting /chat/completions (Gemma 3)...")
        data = {
            "model": "google/gemma-3-27b-it:free",
            "messages": [{"role": "user", "content": "hi"}],
            "max_tokens": 10
        }
        try:
            r = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
            print(f"Status: {r.status_code}")
            if r.status_code == 200:
                print("SUCCESS! The ChatBot is now working.")
                print(f"Response: {r.json()['choices'][0]['message']['content']}")
            else:
                print(f"Failed: {r.text}")
        except Exception as e:
            print(f"Exception: {e}")

import asyncio
if __name__ == "__main__":
    asyncio.run(verify_everything())
