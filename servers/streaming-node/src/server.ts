import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { router } from "./router";
import { backupPort, corsConfig } from "./app.config";
import { errorHandler } from "./middleware/error.middleware";
import http from 'http';
import { WebSocketServer } from 'ws';
import { streamManager } from './services/streamManager';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "", 10) || backupPort;

app.use(cors(corsConfig));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(router);
app.use(errorHandler);

// Create HTTP server to attach WS server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ server });

// Handle WS upgrades and route by URL pattern: /:piId/live/feed
wss.on('connection', (ws, req) => {
  try {
    const url = req.url || '';
    // Expect paths like "/ABC123/live/feed"
    const parts = url.split('?')[0].split('/').filter(Boolean);
    const isValid = parts.length >= 3 && parts[1] === 'live' && parts[2] === 'feed';
    const piId = isValid ? parts[0] : undefined;

    if (!piId) {
      ws.close(1008, 'Invalid path');
      return;
    }

    // Add client to streamManager and send immediate status
    streamManager.addClient(piId, ws);

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg?.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on('close', () => {
      streamManager.removeClient(piId, ws);
    });

    ws.on('error', () => {
      streamManager.removeClient(piId, ws);
    });
  } catch {
    try { ws.close(); } catch {}
  }
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
