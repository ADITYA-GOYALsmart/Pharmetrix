import type { WebSocket } from 'ws';
import { CameraService } from './camera.service';

// Types
export interface ToggleFeedRequest {
  toggleFeed: boolean;
}

export interface LiveStatusResponse {
  live: boolean;
}

export interface ToggleResponse {
  success: true;
  live: boolean;
}

export class StreamManager {
  // Tracks whether a particular piId is live
  private liveStates: Map<string, boolean> = new Map();
  // Connected WebSocket clients per piId
  private clients: Map<string, Set<WebSocket>> = new Map();
  // Active camera services per piId
  private cameras: Map<string, CameraService> = new Map();

  isLive(piId: string): boolean {
    return this.liveStates.get(piId) ?? false;
  }

  // Add a client for a given piId and immediately send status
  addClient(piId: string, ws: WebSocket): void {
    if (!this.clients.has(piId)) {
      this.clients.set(piId, new Set());
    }
    this.clients.get(piId)!.add(ws);
    // Send current status to the newly connected client
    this.safeSend(ws, JSON.stringify({ type: 'status', data: { live: this.isLive(piId) } }));
  }

  // Remove a client for a given piId
  removeClient(piId: string, ws: WebSocket): void {
    const set = this.clients.get(piId);
    if (set) {
      set.delete(ws);
      if (set.size === 0) {
        this.clients.delete(piId);
      }
    }
  }

  // Broadcast a JPEG/PNG base64 frame to all clients subscribed to piId
  broadcastFrame(piId: string, frameBase64: string): void {
    const set = this.clients.get(piId);
    if (!set || set.size === 0) return;

    const payload = JSON.stringify({ type: 'frame', data: frameBase64 });
    for (const client of set) {
      this.safeSend(client, payload);
    }
  }

  // Notify clients of live status change
  notifyStatus(piId: string, live: boolean): void {
    const set = this.clients.get(piId);
    const payload = JSON.stringify({ type: 'status', data: { live } });
    if (!set || set.size === 0) return;
    for (const client of set) {
      this.safeSend(client, payload);
    }
  }

  // Start video feed for a piId (starts camera and begins broadcasting frames)
  startFeed(piId: string): void {
    if (this.isLive(piId)) return; // already live

    // Create camera service and start capturing
    const camera = new CameraService();
    camera.startCapture((frame: Buffer) => {
      // Convert to base64 and broadcast
      const base64 = frame.toString('base64');
      this.broadcastFrame(piId, base64);
    });

    this.cameras.set(piId, camera);
    this.liveStates.set(piId, true);
    this.notifyStatus(piId, true);
  }

  // Stop video feed for a piId (stops camera and notifies clients)
  stopFeed(piId: string): void {
    const cam = this.cameras.get(piId);
    if (cam) {
      cam.stopCapture();
      this.cameras.delete(piId);
    }
    this.liveStates.set(piId, false);
    this.notifyStatus(piId, false);
  }

  // Utility: safely send over WS, ignoring errors
  private safeSend(ws: WebSocket, payload: string) {
    try {
      // 1 = WebSocket.OPEN in ws, but avoid direct enum ref to keep types loose
      // @ts-ignore
      if (ws.readyState === 1) ws.send(payload);
    } catch {
      // ignore send errors
    }
  }
}

// Export a singleton to share state across REST and WS handlers
export const streamManager = new StreamManager();