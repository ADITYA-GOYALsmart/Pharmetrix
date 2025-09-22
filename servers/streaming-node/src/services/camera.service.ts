/*
  CameraService: captures frames from laptop webcam and emits JPEG buffers ~10 FPS.
  Prefers opencv4nodejs when available; falls back to node-webcam if OpenCV isn't installed.
*/

export class CameraService {
  private intervalHandle: NodeJS.Timeout | null = null;
  private running = false;

  // Underlying providers
  private cv: any | null = null;
  private cap: any | null = null; // OpenCV VideoCapture
  private nodeWebcam: any | null = null; // node-webcam instance

  startCapture(callback: (frame: Buffer) => void): void {
    if (this.running) return;

    this.running = true;

    // Try OpenCV first
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cv = require('opencv4nodejs');
      this.cv = cv;
      this.cap = new cv.VideoCapture(0);

      // Set reasonable defaults
      try {
        this.cap.set(cv.CAP_PROP_FRAME_WIDTH, 640);
        this.cap.set(cv.CAP_PROP_FRAME_HEIGHT, 480);
      } catch {
        // ignore if not supported
      }

      // Poll at ~10 FPS
      this.intervalHandle = setInterval(() => {
        if (!this.running || !this.cap) return;
        let frame = this.cap.read();
        // Sometimes first read is empty; try once more
        if (frame.empty) {
          frame = this.cap.read();
        }
        if (!frame.empty) {
          const buf: Buffer = this.cv.imencode('.jpg', frame);
          callback(buf);
        }
      }, 100);

      return;
    } catch (e) {
      // OpenCV not available; fallback to node-webcam
    }

    // Fallback: node-webcam (no native build, uses platform tools)
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const NodeWebcam = require('node-webcam');
      this.nodeWebcam = NodeWebcam.create({
        width: 640,
        height: 480,
        quality: 80,
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
      }, 100);
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