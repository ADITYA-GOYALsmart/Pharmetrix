import { Request, Response } from 'express';
import { streamManager, LiveStatusResponse } from '../services/streamManager';

export const getLiveStatus = (req: Request, res: Response<LiveStatusResponse>) => {
  const { piId } = req.params;
  const live = streamManager.isLive(piId);
  res.json({ live });
};

export const toggleFeed = (req: Request, res: Response) => {
  const { piId } = req.params;
  const { toggleFeed } = req.body as { toggleFeed?: boolean };
  if (typeof toggleFeed !== 'boolean') {
    return res.status(400).json({ error: 'Invalid toggleFeed' });
  }

  if (toggleFeed) {
    streamManager.startFeed(piId);
  } else {
    streamManager.stopFeed(piId);
  }

  res.json({ success: true, live: toggleFeed });
};