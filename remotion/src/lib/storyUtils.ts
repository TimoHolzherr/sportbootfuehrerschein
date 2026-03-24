import { Episode } from "./schema";
import { msToFrames } from "./timing";

/** Total frames for an episode, accounting for overlapping transitions. */
export function computeTotalFrames(episode: Episode): number {
  const fps = episode.fps ?? 30;
  let total = 0;
  for (let i = 0; i < episode.scenes.length; i++) {
    const scene = episode.scenes[i];
    const durationFrames = msToFrames(scene.duration_ms, fps);
    const transitionMs = scene.transition?.duration_ms ?? 0;
    const overlap = i < episode.scenes.length - 1 ? msToFrames(transitionMs, fps) : 0;
    total += durationFrames - overlap;
  }
  return total;
}
