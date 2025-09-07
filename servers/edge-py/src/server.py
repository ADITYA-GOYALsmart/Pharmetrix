import os
import sys
from typing import List

# Ensure the current src directory is importable for namespace-style packages
CURRENT_DIR = os.path.dirname(__file__)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Routers
from router import api_router  # noqa: E402


def create_app() -> FastAPI:
    app = FastAPI(title="SPIS Edge Backend", version="0.1.0")

    # Middleware setup
    allowed_origins: List[str] = os.getenv("CORS_ALLOWED_ORIGINS", "*").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers
    app.include_router(api_router)

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    # Run using module path so that hot-reload works nicely
    uvicorn.run("src.server:app", host="0.0.0.0", port=port, reload=True)