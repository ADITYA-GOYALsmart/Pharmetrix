import { Request, Response } from 'express';
import { StreamManager, LiveStatusResponse, ToggleResponse } from '../services/streamManager';

const streamManager = new StreamManager();

export const getLiveStatus = (req: Request, res: Response<LiveStatusResponse>) => {
  const { piId } = req.params;
  const live = streamManager.isLive(piId);
  res.json({ live });
};

export const toggleFeed = (req: Request, res: Response) => {
  const { piId } = req.params;
  const { toggleFeed } = req.body;
  if (typeof toggleFeed !== 'boolean') {
    return res.status(400).json({ error: 'Invalid toggleFeed' });
  }
  streamManager.toggleFeed(piId, toggleFeed);
  res.json({ success: true, live: toggleFeed });
};