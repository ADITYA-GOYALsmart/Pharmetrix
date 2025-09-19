import express from "express";
import { getLiveStatus, toggleFeed } from "./controllers/streamController";
import { authMiddleware } from "./middleware/auth.middleware";

export const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send('Welcome to SPIS Streaming Node Backend');
});

router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Streaming routes
router.get('/:piId/live', authMiddleware, getLiveStatus);
router.post('/:piId/live/toggleFeed', authMiddleware, toggleFeed);