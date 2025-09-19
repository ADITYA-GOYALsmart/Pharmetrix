# README.md

# Frontend – SPIS Dashboard & POS

## Description

React application for dashboard and POS management. Displays inventory, fridge status, alerts, live streaming, and supports POS transactions.

## Features

* Inventory management UI
* POS interface with barcode scanning
* Dashboard visualization for fridge temperature, alerts, CV stock counts, and motion detection
* Live video streaming from Backend 3

## Tech Stack

* React + TypeScript
* Tailwind / Material UI
* Axios for API calls

## Running

```bash
cd frontend
npm install
npm start
```

## Environment Variables

* `REACT_APP_BACKEND1_URL` – URL for inventory/POS backend
* `REACT_APP_BACKEND3_URL` – URL for streaming service
