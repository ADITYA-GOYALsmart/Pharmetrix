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
  private liveStates: Map<string, boolean> = new Map();

  isLive(piId: string): boolean {
    return this.liveStates.get(piId) ?? false;
  }

  toggleFeed(piId: string, state: boolean): void {
    this.liveStates.set(piId, state);
  }
}