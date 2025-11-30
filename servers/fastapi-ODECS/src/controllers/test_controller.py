import os
from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter()


@router.get("/test")
async def test_ping_remote():
    """
    Calls the remote backend and returns its JSON response as-is.
    Default URL can be overridden by REMOTE_BACKEND_URL env var.
    """
    remote_url = os.getenv("REMOTE_BACKEND_URL", "https://pharmetrix.onrender.com")
    # If the remote has a specific health/ping endpoint, append it here.
    # For now, call the base URL.
    url = remote_url.rstrip("/ping")

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            content_type = resp.headers.get("content-type", "").lower()
            if "application/json" in content_type:
                return {"remote_url": url, "response": resp.json()}
            else:
                return {"remote_url": url, "response": resp.text}
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Remote error: {e}")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {e}")