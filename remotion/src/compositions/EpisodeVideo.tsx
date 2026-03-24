import React from "react";
import { Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Episode, Scene } from "../lib/schema";
import { computeTotalFrames } from "../lib/storyUtils";
import { msToFrames } from "../lib/timing";
import { IntroScene } from "./scenes/IntroScene";
import { QuestionScene } from "./scenes/QuestionScene";
import { ExplanationScene } from "./scenes/ExplanationScene";
import { OutroScene } from "./scenes/OutroScene";

const AUDIO_LEAD_IN_FRAMES = 12; // 0.4s — matches LEAD_IN_MS in sync-durations.ts

interface Props {
  episode: Episode;
}

interface SceneTiming {
  scene: Scene;
  startFrame: number;
  durationFrames: number;
  transitionFrames: number;
  incomingTransitionFrames: number;
}

function buildTimings(episode: Episode): SceneTiming[] {
  const fps = episode.fps ?? 30;
  const timings: SceneTiming[] = [];
  let cursor = 0;

  for (let i = 0; i < episode.scenes.length; i++) {
    const scene = episode.scenes[i];
    const durationFrames = msToFrames(scene.duration_ms, fps);
    const transitionFrames = scene.transition
      ? msToFrames(scene.transition.duration_ms, fps)
      : 0;
    const incomingTransitionFrames =
      i > 0 ? msToFrames(episode.scenes[i - 1].transition?.duration_ms ?? 0, fps) : 0;

    timings.push({ scene, startFrame: cursor, durationFrames, transitionFrames, incomingTransitionFrames });
    cursor += durationFrames - (i < episode.scenes.length - 1 ? transitionFrames : 0);
  }

  return timings;
}

function SceneRenderer({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "intro":       return <IntroScene scene={scene} />;
    case "question":    return <QuestionScene scene={scene} />;
    case "explanation": return <ExplanationScene scene={scene} />;
    case "outro":       return <OutroScene scene={scene} />;
  }
}

export const EpisodeVideo: React.FC<Props> = ({ episode }) => {
  const frame = useCurrentFrame();
  const timings = buildTimings(episode);
  const totalFrames = computeTotalFrames(episode);
  const fadeFrames = 18; // 0.6s music fade

  const musicVolume = episode.music
    ? interpolate(
        frame,
        [0, fadeFrames, totalFrames - fadeFrames, totalFrames],
        [0, episode.music_volume ?? 0.08, episode.music_volume ?? 0.08, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", backgroundColor: "#0A2342" }}>
      {episode.jingle && (() => {
        // Scope jingle to the intro scene only
        const introScene = episode.scenes.find((s) => s.type === "intro");
        const fps = episode.fps ?? 30;
        const introDuration = introScene ? msToFrames(introScene.duration_ms, fps) : 90;
        const jingleFadeEnd = introDuration + AUDIO_LEAD_IN_FRAMES;
        const jingleFadeStart = jingleFadeEnd - 45; // ~1.5s fade
        return (
          <>
            <Sequence from={0} durationInFrames={jingleFadeEnd} layout="none">
              <Audio
                src={staticFile(episode.jingle)}
                volume={(f) => interpolate(f, [jingleFadeStart, jingleFadeEnd], [0.15, 0], {
                  extrapolateLeft: "clamp", extrapolateRight: "clamp",
                })}
              />
            </Sequence>
            {episode.jingle_voice && (
              <Sequence from={20} layout="none">
                <Audio src={staticFile(episode.jingle_voice)} volume={1} />
              </Sequence>
            )}
          </>
        );
      })()}
      {episode.music && (
        <Audio src={staticFile(episode.music)} volume={musicVolume} />
      )}

      {timings.map((t, i) => {
        const { scene, startFrame, durationFrames, transitionFrames, incomingTransitionFrames } = t;
        const isLastScene = i === timings.length - 1;
        const globalFrameInScene = frame - startFrame;
        const fadeOutStart = durationFrames - transitionFrames;

        const exitOpacity =
          transitionFrames > 0 && !isLastScene && scene.transition?.type === "fade"
            ? interpolate(globalFrameInScene, [fadeOutStart, durationFrames], [1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 1;

        const audioFrom = incomingTransitionFrames + AUDIO_LEAD_IN_FRAMES;
        const audioDuration = Math.max(1, durationFrames - audioFrom);

        return (
          <Sequence key={scene.id} from={startFrame} durationInFrames={durationFrames} layout="none">
            <div style={{ position: "absolute", inset: 0, opacity: exitOpacity }}>
              <SceneRenderer scene={scene} />
            </div>

            {scene.audio && (
              <Sequence from={audioFrom} durationInFrames={audioDuration} layout="none">
                <Audio src={staticFile(scene.audio)} />
              </Sequence>
            )}
          </Sequence>
        );
      })}
    </div>
  );
};
