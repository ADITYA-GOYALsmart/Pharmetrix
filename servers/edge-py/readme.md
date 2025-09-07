# SPIS Edge Python Backend (FastAPI)

A lightweight FastAPI backend designed for Raspberry Pi edge processing and sensor integrations, following a clean, scalable folder structure.

## Structure
```
edge-py/
├── src/
│   ├── controllers/    # FastAPI route handlers
│   ├── services/       # business logic
│   ├── middleware/     # request/response middlewares
│   ├── utils/          # helper functions
│   ├── config/         # configuration (env, app settings)
│   ├── router.py       # centralized router registration
│   └── server.py       # entrypoint
├── client.py           # simple client using httpx
├── requirements.txt
└── .env.example
```

## Quickstart
1. Install dependencies
```bash
pip install -r requirements.txt
```

2. Run the FastAPI server (with reload)
```bash
uvicorn src.server:app --host 0.0.0.0 --port 8000 --reload
```

3. Run the client script
```bash
python client.py
```

## Endpoints
- GET `/ping` → `{ "pong": true }`

## Environment Variables
- `PORT` (default: 8000)
- `CORS_ALLOWED_ORIGINS` (default: `*`)
- `EDGE_BASE_URL` (used by client.py, default: `http://localhost:8000`)