# Backend 2 – Edge Pi & Sensors

## Description

Runs on Raspberry Pi. Handles sensor reading, computer vision for vial counting, motion detection, and sends data to Backend 1.

## Features

* Read temperature (DS18B20) and optional humidity (DHT22).
* Run computer vision to count vials in trays.
* Optional motion detection.
* Send sensor & CV data to cloud backend.
* Expose API for live streaming feed to Backend 3.

## Tech Stack

* Python 3.11+
* FastAPI / Flask
* OpenCV, TensorFlow Lite (optional)
* Sensor libraries (w1thermsensor, Adafruit\_DHT, etc.)

## Running

```bash
cd backend-edge-pi
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Environment Variables

* `BACKEND1_API_URL` – URL of Backend 1
* `DEVICE_ID` – Unique Pi device ID
* `DEVICE_TOKEN` – Authentication token for pairing
