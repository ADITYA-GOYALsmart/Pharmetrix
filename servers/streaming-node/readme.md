# Backend 3 – Streaming Service

## Description

Provides live streaming of fridge interiors from Raspberry Pi to frontend dashboard.

## Features

* Connects to Python backend camera feed.
* Streams MJPEG / WebSocket video to frontend.
* Optional snapshot saving.

## Tech Stack

* Node.js + TypeScript
* WebSocket / MJPEG streaming

## Running

```bash
cd backend-streaming
npm install
npm run dev
```

## Environment Variables

* `PYTHON_CAMERA_API` – URL to access live feed from Backend 2
* `PORT` – Port for streaming service
