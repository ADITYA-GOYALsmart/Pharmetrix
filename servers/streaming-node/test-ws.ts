/*
  Simple WebSocket test client for streaming-node
  - Connects to ws://localhost:4000/TEST_PI/live/feed
  - Logs status messages and counts frames
  - Exits after ~5 seconds or after 10 frames
*/

import WebSocket from 'ws';

const HOST = process.env.HOST || 'localhost:4000';
const PI_ID = process.env.PI_ID || 'TEST_PI';
const URL = `ws://${HOST}/${PI_ID}/live/feed`;

let frameCount = 0;
const maxFrames = 10;
const maxMs = 5000;

const ws = new WebSocket(URL);

ws.on('open', () => {
  console.log('WS connected:', URL);
  ws.send(JSON.stringify({ type: 'ping' }));
  // Safety timeout to close after maxMs
  setTimeout(() => {
    console.log(`Timeout reached (${maxMs}ms). Closing.`);
    try { ws.close(); } catch {}
  }, maxMs);
});

ws.on('message', (data) => {
  try {
    const msg = JSON.parse(data.toString());
    if (msg.type === 'status') {
      console.log('Status:', msg.data);
    } else if (msg.type === 'frame') {
      frameCount++;
      console.log(`Frame ${frameCount} size:`, msg.data?.length || 0);
      if (frameCount >= maxFrames) {
        console.log('Max frames received. Closing.');
        try { ws.close(); } catch {}
      }
    } else {
      console.log('Other message:', msg);
    }
  } catch (e) {
    console.log('Non-JSON message:', data.toString());
  }
});

ws.on('close', () => {
  console.log('WS closed');
  process.exit(0);
});

ws.on('error', (e) => {
  console.error('WS error', e);
});