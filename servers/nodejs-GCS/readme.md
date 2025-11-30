# Backend 1 – Inventory & POS

## Description

Handles core business logic for inventory and point-of-sale. Manages stock receiving, batching, restocking, POS transactions, and alerts based on sensor data.

## Features

* CRUD operations for medicines and batches.
* POS transactions with LIFO batch selection.
* Inventory suggestions for optimal fridge placement based on temperature.
* Receive sensor data from Backend 2 and trigger alerts.

## Tech Stack

* Node.js + TypeScript
* NestJS / Express
* MongoDB for inventory and batches
* InfluxDB (optional) for time-series sensor data

## Running

```bash
cd backend-inventory-pos
npm install
npm run dev
```

## Environment Variables

* `MONGO_URI` – MongoDB connection string
* `SENSOR_API_ENDPOINT` – URL for receiving data from Backend 2
* `PORT` – Port to run backend on
