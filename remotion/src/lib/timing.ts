export const FPS = 30;

export function msToFrames(ms: number, fps = FPS): number {
  return Math.round((ms / 1000) * fps);
}

export function framesToMs(frames: number, fps = FPS): number {
  return (frames / fps) * 1000;
}
