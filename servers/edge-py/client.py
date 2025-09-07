import json
import os

import httpx
from dotenv import load_dotenv


def main():
    load_dotenv()
    base_url = os.getenv("EDGE_BASE_URL", "http://localhost:8000")
    url = f"{base_url.rstrip('/')}/test"

    try:
        with httpx.Client(timeout=10) as client:
            resp = client.get(url)
            resp.raise_for_status()
            try:
                body = resp.json()
            except json.JSONDecodeError:
                body = resp.text
            print(f"Acknowledged response: {body}")
    except httpx.HTTPError as e:
        print(f"Request failed: {e}")


if __name__ == "__main__":
    main()