import os

import requests

from app.sync import sync_ucc_sources


def main():
    api_url = os.getenv("ASKI_SYNC_API_URL")
    token = os.getenv("ASKI_SYNC_API_TOKEN")

    if api_url:
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        response = requests.post(
            f"{api_url.rstrip('/')}/api/sync/ucc",
            headers=headers,
            timeout=60,
        )
        response.raise_for_status()
        print(response.text)
        return

    print(sync_ucc_sources())


if __name__ == "__main__":
    main()
