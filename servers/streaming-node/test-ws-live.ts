import WebSocket from 'ws';

const HOST = process.env.HOST || 'localhost:4000';
const PI_ID = process.env.PI_ID || 'TEST_PI';
const URL = `ws://${HOST}/${PI_ID}/live/feed`;

let frameCount = 0;

const ws = new WebSocket(URL);

ws.on('open', () => {
  console.log('WS connected:', URL);
  console.log('Stream will continue until you press Ctrl+C to terminate');
  
  // Send request to start the feed
  console.log('Requesting to start feed...');
  ws.send(JSON.stringify({ toggleFeed: true }));
});

ws.on('message', (data) => {
  try {
    const msg = JSON.parse(data.toString());
    if (msg.type === 'status') {
      console.log('Status:', msg.data);
      if (msg.data.live) {
        console.log('Stream is now live!');
      }
    } else if (msg.type === 'frame') {
      frameCount++;
      // Only log every 30 frames (about once per second) to avoid console flood
      if (frameCount % 30 === 0) {
        console.log(`Frames received: ${frameCount}, Latest frame size:`, msg.data?.length || 0);
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
  console.error('WS error:', e);
});