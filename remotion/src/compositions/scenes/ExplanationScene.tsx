import React from "react";
import { Audio, Img, interpolate, Sequence, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { ExplanationScene as ExplanationSceneType } from "../../lib/schema";
import { COLORS, GRADIENTS } from "../../lib/colors";
import { parseBody } from "../../lib/bodyParser";
import { msToFrames } from "../../lib/timing";

interface Props {
  scene: ExplanationSceneType;
}

const ANSWER_LABELS = ["A", "B", "C", "D"];

// White overlay opacity when image is used as background (light theme)
const WHITE_OVERLAY = 0.82;

// ── Mini answer card ──────────────────────────────────────────────────────────

function MiniAnswerCard({ label, text, isCorrect, isLight }: {
  label: string; text: string; isCorrect: boolean; isLight: boolean;
}) {
  const accent = isCorrect ? COLORS.correct : (isLight ? "#DC2626" : "rgba(255,255,255,0.35)");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px 10px 0",
        borderRadius: 10,
        background: isLight ? "rgba(255,255,255,0.92)" : (isCorrect ? COLORS.correctBg : "rgba(255,255,255,0.06)"),
        borderLeft: `4px solid ${accent}`,
        boxShadow: isLight ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          borderRadius: 5,
          background: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 8,
        }}
      >
        <span style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 12,
          fontWeight: 800,
          color: "#fff",
        }}>
          {label}
        </span>
      </div>
      <span style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 18,
        color: isLight ? "#0A2342" : (isCorrect ? COLORS.white : COLORS.whiteAlpha70),
        lineHeight: 1.35,
        fontWeight: isCorrect ? 600 : 400,
      }}>
        {text}
      </span>
    </div>
  );
}

// ── Single animated bullet ────────────────────────────────────────────────────

function AnimatedBullet({
  kind, text, state, frame, activeFrame, isLight,
}: {
  kind: "paragraph" | "bullet" | "tip";
  text: string;
  state: "upcoming" | "active" | "done";
  frame: number;
  activeFrame: number;
  isLight: boolean;
}) {
  const slideIn = interpolate(frame, [activeFrame - 2, activeFrame + 10], [20, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [activeFrame, activeFrame + 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  if (state === "upcoming") return null;

  const isActive = state === "active";

  if (kind === "tip") {
    return (
      <div style={{
        transform: `translateY(${slideIn}px)`,
        opacity,
        background: isLight ? "rgba(245,166,35,0.22)" : COLORS.highlightDim,
        border: `2px solid ${COLORS.highlight}`,
        borderRadius: 10,
        padding: "14px 20px",
      }}>
        <span style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 30,
          fontWeight: 600,
          color: isLight ? "#7B4A00" : COLORS.highlight,
          lineHeight: 1.5,
        }}>
          {text}
        </span>
      </div>
    );
  }

  if (kind === "bullet") {
    return (
      <div style={{
        transform: `translateY(${slideIn}px)`,
        opacity,
      }}>
        <span style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 32,
          color: isLight ? "#0A2342" : COLORS.white,
          lineHeight: 1.5,
          fontWeight: isActive ? 600 : 400,
        }}>
          {text}
        </span>
      </div>
    );
  }

  // paragraph
  return (
    <p style={{
      transform: `translateY(${slideIn}px)`,
      opacity,
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: 32,
      color: isLight ? "rgba(10,35,66,0.6)" : COLORS.whiteAlpha70,
      lineHeight: 1.6,
      margin: 0,
    }}>
      {text}
    </p>
  );
}

// ── Main scene ────────────────────────────────────────────────────────────────

export const ExplanationScene: React.FC<Props> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const hasQuestion = !!(scene.question && scene.answers && scene.correct !== undefined);
  const hasBackground = !!scene.background;
  const imageDurationFrames = msToFrames(scene.image_duration_ms ?? 4000, fps);
  // If image_duration_ms covers the whole scene, stay fullscreen (setup mode)
  const imageFillsScene = imageDurationFrames >= durationInFrames;

  // Light theme: image is visible as background behind content (not a setup-only scene)
  const isLight = hasBackground && !imageFillsScene;

  // Image: stays at full opacity. For setup-only scenes, fades to 0 at very end (scene transition).
  const imageOpacity = !hasBackground
    ? 0
    : imageFillsScene
    ? interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      })
    : 1;

  // Split layout fades in after image phase (or immediately for light-theme scenes)
  const splitFadeStart = hasBackground && !imageFillsScene ? imageDurationFrames - 6 : 0;
  const splitOpacity = imageFillsScene
    ? 0
    : interpolate(frame, [splitFadeStart, splitFadeStart + 18], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });

  const bodyParts = scene.body ? parseBody(scene.body) : [];

  const BULLET_STAGGER_FRAMES = 8;
  const contentStart = hasBackground ? imageDurationFrames : msToFrames(800, fps);

  const getBulletActiveFrame = (i: number): number => {
    if (scene.body_audio_offsets_ms && scene.body_audio_offsets_ms[i] != null) {
      return msToFrames(scene.body_audio_offsets_ms[i], fps);
    }
    return contentStart + i * BULLET_STAGGER_FRAMES;
  };

  const getBulletAudioSrc = (i: number): string =>
    scene.audio!.replace(/\.mp3$/, "") + `-b${i}.mp3`;

  return (
    <div style={{ position: "absolute", inset: 0, background: GRADIENTS.navyExplanation }}>

      {/* ── Background image ── */}
      {hasBackground && (
        <div style={{ position: "absolute", inset: 0, opacity: imageOpacity, zIndex: 1 }}>
          <Img
            src={staticFile(scene.background!)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Dark gradient overlay for setup-only (fullscreen) mode */}
          {imageFillsScene && (
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(10,35,66,0.7) 100%)",
            }} />
          )}
        </div>
      )}

      {/* ── White frosted overlay (light theme only) ── */}
      {isLight && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 2,
          background: `rgba(255,255,255,${WHITE_OVERLAY})`,
          opacity: splitOpacity,
        }} />
      )}

      {/* ── Split layout ── */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex",
        flexDirection: "row",
        opacity: splitOpacity,
        zIndex: 3,
      }}>

        {/* Top accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 6,
          background: `linear-gradient(90deg, ${COLORS.highlight}, ${COLORS.ocean})`,
        }} />

        {/* LEFT: question reference */}
        {hasQuestion && (
          <div style={{
            width: "40%",
            borderRight: `1px solid ${isLight ? "rgba(10,35,66,0.12)" : COLORS.border}`,
            display: "flex",
            flexDirection: "column",
            padding: "55px 36px 55px 56px",
            gap: 10,
          }}>
            <span style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: COLORS.ocean,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}>
              Die Frage
            </span>
            <p style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 21,
              fontWeight: 700,
              color: isLight ? "#0A2342" : COLORS.whiteAlpha70,
              lineHeight: 1.5,
              margin: 0,
              marginBottom: 16,
            }}>
              {scene.question}
            </p>
            <div style={{ display: "grid", gridTemplateRows: "repeat(4, 1fr)", gap: 8, flex: 1, minHeight: 0 }}>
              {scene.answers!.map((answer, i) => (
                <MiniAnswerCard
                  key={i}
                  label={ANSWER_LABELS[i]}
                  text={answer}
                  isCorrect={i === scene.correct}
                  isLight={isLight}
                />
              ))}
            </div>
          </div>
        )}

        {/* RIGHT: animated explanation */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: hasQuestion ? "70px 60px 70px 48px" : "70px 100px",
          gap: 18,
          overflow: "hidden",
        }}>
          {scene.headline && (
            <h2 style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: hasQuestion ? 36 : 50,
              fontWeight: 800,
              color: isLight ? "#0A2342" : COLORS.white,
              lineHeight: 1.2,
              margin: 0,
              marginBottom: 20,
              paddingBottom: 18,
              borderBottom: `3px solid ${COLORS.highlight}`,
            }}>
              {scene.headline}
            </h2>
          )}

          {/* Bullets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {bodyParts.map((part, i) => {
              const activeFrame = getBulletActiveFrame(i);
              const state: "upcoming" | "active" | "done" =
                frame < activeFrame ? "upcoming" : "done";

              return (
                <AnimatedBullet
                  key={i}
                  kind={part.kind}
                  text={part.text}
                  state={state}
                  frame={frame}
                  activeFrame={activeFrame}
                  isLight={isLight}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Per-bullet audio */}
      {scene.audio && scene.body_audio_offsets_ms && scene.body_audio_offsets_ms.map((offsetMs, i) => (
        <Sequence key={i} from={msToFrames(offsetMs, fps)} layout="none">
          <Audio src={staticFile(getBulletAudioSrc(i))} />
        </Sequence>
      ))}

      {/* Branding */}
      <div style={{
        position: "absolute", bottom: 22, right: 56, zIndex: 4,
        opacity: isLight ? 0.5 : 0.35,
      }}>
        <span style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 17,
          color: isLight ? "rgba(10,35,66,0.5)" : COLORS.whiteAlpha40,
          letterSpacing: "0.06em",
        }}>
          ⚓ Klar zum Entern
        </span>
      </div>
    </div>
  );
};
