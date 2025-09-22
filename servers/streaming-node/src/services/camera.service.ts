/*
  CameraService: captures frames from laptop webcam and emits JPEG buffers.
  Prefers opencv4nodejs when available; falls back to node-webcam if OpenCV isn't installed.
  Target FPS and quality are configurable via env vars.

  Env vars (optional):
  - STREAM_FPS: target frames per second (default 24, clamped 1..60)
  - STREAM_WIDTH: frame width (default 640)
  - STREAM_HEIGHT: frame height (default 480)
  - STREAM_JPEG_QUALITY: JPEG quality 10..95 (default 70)
*/

export class CameraService {
  private intervalHandle: NodeJS.Timeout | null = null;
  private running = false;

  // Underlying providers
  private cv: any | null = null;
  private cap: any | null = null; // OpenCV VideoCapture
  private nodeWebcam: any | null = null; // node-webcam instance

  // Config (read once per service)
  private readonly width = Number.parseInt(process.env.STREAM_WIDTH || '640', 10) || 640;
  private readonly height = Number.parseInt(process.env.STREAM_HEIGHT || '480', 10) || 480;
  private readonly targetFps = Math.max(1, Math.min(60, Number.parseInt(process.env.STREAM_FPS || '24', 10) || 24));
  private readonly intervalMs = Math.max(1, Math.floor(1000 / (Number.isFinite(this.targetFps) ? this.targetFps : 24)));
  private readonly jpegQuality = Math.max(10, Math.min(95, Number.parseInt(process.env.STREAM_JPEG_QUALITY || '70', 10) || 70));

  startCapture(callback: (frame: Buffer) => void): void {
    if (this.running) return;
    this.running = true;

    // Try OpenCV first (best performance and control)
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cv = require('opencv4nodejs');
      this.cv = cv;
      this.cap = new cv.VideoCapture(0);

      // Set resolution
      try {
        this.cap.set(cv.CAP_PROP_FRAME_WIDTH, this.width);
        this.cap.set(cv.CAP_PROP_FRAME_HEIGHT, this.height);
      } catch {
        // ignore if not supported
      }

      // Try to set FPS if supported
      try {
        this.cap.set(cv.CAP_PROP_FPS, this.targetFps);
      } catch {
        // ignore if not supported
      }

      // Poll at configured FPS
      this.intervalHandle = setInterval(() => {
        if (!this.running || !this.cap) return;
        let frame = this.cap.read();
        // Sometimes first read is empty; try once more
        if (frame.empty) {
          frame = this.cap.read();
        }
        if (!frame.empty) {
          // Use lower JPEG quality for throughput
          const encodeParams = [this.cv!.IMWRITE_JPEG_QUALITY, this.jpegQuality];
          const buf: Buffer = this.cv!.imencode('.jpg', frame, encodeParams);
          callback(buf);
        }
      }, this.intervalMs);

      return;
    } catch (e) {
      // OpenCV not available; fallback to node-webcam
    }

    // Fallback: node-webcam (spawns CLI per frame; actual FPS depends on platform tools)
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const NodeWebcam = require('node-webcam');
      this.nodeWebcam = NodeWebcam.create({
        width: this.width,
        height: this.height,
        quality: this.jpegQuality, // reduce quality to help hit target FPS
        output: 'jpeg',
        // Return raw buffer to avoid disk writes
        callbackReturn: 'buffer',
        verbose: false,
      });

      this.intervalHandle = setInterval(() => {
        if (!this.running || !this.nodeWebcam) return;
        // node-webcam requires a shot name but won't write to disk if callbackReturn is buffer
        this.nodeWebcam.capture('frame', (err: Error | null, data: Buffer) => {
          if (err || !data) return;
          callback(data);
        });
      }, this.intervalMs);
    } catch (e) {
      // If both providers fail, stop running to avoid tight loop
      this.running = false;
      if (this.intervalHandle) {
        clearInterval(this.intervalHandle);
        this.intervalHandle = null;
      }
      throw new Error('No camera provider available. Install opencv4nodejs or ensure node-webcam works on this platform.');
    }
  }

  stopCapture(): void {
    this.running = false;
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    if (this.cap && this.cv) {
      try { this.cap.release(); } catch {}
      this.cap = null;
      this.cv = null;
    }
    // node-webcam does not hold persistent resources we must close
    this.nodeWebcam = null;
  }
}