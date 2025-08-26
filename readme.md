# README.md

# Smart Pharmaceutical Inventory System (SPIS)

SPIS is a comprehensive inventory management solution for pharmaceuticals. It integrates full-stack development, edge computing with Raspberry Pi, IoT sensors, computer vision, and live video streaming to provide real-time stock monitoring, automated alerts, and efficient point-of-sale management.

## Features

* Inventory management: stock receiving, batching, sorting, and restocking.
* Point-of-Sale (POS) system with LIFO batch management.
* Edge sensor integration for temperature and optional humidity monitoring.
* Optional computer vision for vial counting.
* Optional motion detection inside storage fridges.
* Live streaming of fridge interiors.
* Dashboard with alerts and visualization.

## Directory Structure

SPIS/
├─ backend-inventory-pos/     # Node.js backend for inventory & POS
├─ backend-edge-pi/           # Python backend for sensors, CV, motion detection
├─ backend-streaming/         # Node.js backend for live streaming
├─ frontend/                  # React frontend dashboard & POS
└─ README.md                  # Project-level README

## Getting Started

1. Set up the backend services individually.
2. Set up the frontend React application.
3. Connect Raspberry Pi with sensors and camera to Backend 2.
4. Configure environment variables for API endpoints.
5. Start services in order: Backend 1 → Backend 2 → Backend 3 → Frontend.
