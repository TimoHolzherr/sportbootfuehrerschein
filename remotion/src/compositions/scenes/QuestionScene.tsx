import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { QuestionScene as QuestionSceneType } from "../../lib/schema";
import { COLORS } from "../../lib/colors";
import { msToFrames } from "../../lib/timing";

interface Props {
  scene: QuestionSceneType;
}

const ANSWER_LABELS = ["A", "B", "C", "D"];

const ANSWER_COLORS = [
  { bg: "#2563EB", dim: "rgba(37,99,235,0.38)" },   // A — blue
  { bg: "#7C3AED", dim: "rgba(124,58,237,0.38)" },  // B — purple
  { bg: "#D97706", dim: "rgba(217,119,6,0.38)" },   // C — amber
  { bg: "#0891B2", dim: "rgba(8,145,178,0.38)" },   // D — cyan
];

const WHITE_OVERLAY = 0.82;

interface AnswerCardProps {
  index: number;
  label: string;
  text: string;
  state: "neutral" | "correct" | "wrong";
  revealProgress: number;
  enterFrame: number;
  frame: number;
  fps: number;
  isLight: boolean;
}

const AnswerCard: React.FC<AnswerCardProps> = ({
  index, label, text, state, revealProgress, enterFrame, frame, fps, isLight,
}) => {
  const enter = spring({ fps, frame: frame - enterFrame, config: { stiffness: 100, damping: 18 }, durationInFrames: 20 });
  const opacity = Math.min(1, Math.max(0, (frame - enterFrame) / 6));

  const color = ANSWER_COLORS[index];

  const accentColor =
    state === "correct" ? COLORS.correct
    : state === "wrong"  ? `rgba(220,38,38,${0.5 + revealProgress * 0.4})`
    : color.bg;

  const cardBg = isLight
    ? (state === "correct" ? "rgba(46,204,113,0.12)" : state === "wrong" ? `rgba(220,38,38,${revealProgress * 0.08})` : "rgba(255,255,255,0.92)")
    : (state === "correct" ? "rgba(46,204,113,0.2)" : state === "wrong" ? "rgba(255,255,255,0.03)" : color.dim);

  const textOpacity = state === "wrong" ? 1 - revealProgress * 0.35 : 1;
  const textColor = isLight ? "#0A2342" : "#fff";

  return (
    <div
      style={{
        opacity,
        transform: `scale(${0.88 + enter * 0.12})`,
        background: cardBg,
        borderLeft: `5px solid ${accentColor}`,
        borderRadius: 16,
        padding: "28px 32px",
        display: "flex",
        alignItems: "center",
        gap: 22,
        boxShadow: isLight ? "0 2px 10px rgba(0,0,0,0.09)" : "none",
      }}
    >
      {/* Letter badge */}
      <div
        style={{
          flexShrink: 0,
          width: 44,
          height: 44,
          borderRadius: 10,
          background: accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 22,
          fontWeight: 900,
          color: "#fff",
          lineHeight: 1,
        }}>
          {label}
        </span>
      </div>

      <span style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 28,
        fontWeight: 500,
        color: textColor,
        lineHeight: 1.35,
        opacity: textOpacity,
      }}>
        {text}
      </span>

      {state === "correct" && revealProgress > 0.5 && (
        <div style={{
          marginLeft: "auto",
          flexShrink: 0,
          opacity: (revealProgress - 0.5) * 2,
          fontSize: 32,
          color: COLORS.correct,
        }}>
          ✓
        </div>
      )}
    </div>
  );
};

export const QuestionScene: React.FC<Props> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isLight = !!scene.background;
  const revealFrame = msToFrames(scene.reveal_ms, fps);
  const revealProgress = interpolate(frame, [revealFrame, revealFrame + 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const answered = frame >= revealFrame;
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const questionEnter = spring({ fps, frame, config: { stiffness: 70, damping: 20 }, durationInFrames: 25 });

  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeIn }}>

      {/* Background image */}
      {scene.background && (
        <>
          <Img
            src={staticFile(scene.background)}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: `rgba(255,255,255,${WHITE_OVERLAY})`,
          }} />
        </>
      )}

      {/* Content */}
      <div style={{
        position: "absolute", inset: 0,
        background: scene.background ? "transparent" : "linear-gradient(150deg, #060F1E 0%, #0A1F38 50%, #060D1A 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "56px 72px 48px",
        gap: 0,
      }}>

        {/* Top accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 5,
          background: `linear-gradient(90deg, ${COLORS.ocean}, ${COLORS.highlight}, ${COLORS.ocean})`,
        }} />

        {/* Counter pill + catalog number */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{
            background: isLight ? "rgba(30,144,255,0.12)" : "rgba(30,144,255,0.15)",
            border: `1px solid rgba(30,144,255,${isLight ? 0.4 : 0.3})`,
            borderRadius: 100,
            padding: "6px 20px",
          }}>
            <span style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 19,
              fontWeight: 700,
              color: COLORS.ocean,
              letterSpacing: "0.04em",
            }}>
              Frage {scene.question_number} / {scene.question_total}
            </span>
          </div>
          {scene.catalog_number != null && (
            <span style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 16,
              fontWeight: 500,
              color: isLight ? "rgba(10,35,66,0.4)" : "rgba(255,255,255,0.35)",
              letterSpacing: "0.03em",
            }}>
              Katalog-Nr. {scene.catalog_number}
            </span>
          )}
        </div>

        {/* Question */}
        <div style={{
          transform: `translateY(${(1 - questionEnter) * 20}px)`,
          marginBottom: 40,
          flex: "0 0 auto",
        }}>
          <h2 style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 42,
            fontWeight: 800,
            color: isLight ? "#0A2342" : "#fff",
            lineHeight: 1.35,
            margin: 0,
            maxWidth: 1560,
          }}>
            {scene.question}
          </h2>
        </div>

        {/* Answer grid — 2×2 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 16,
          flex: 1,
          minHeight: 0,
        }}>
          {scene.answers.map((answer, i) => (
            <AnswerCard
              key={i}
              index={i}
              label={ANSWER_LABELS[i]}
              text={answer}
              state={answered ? (i === scene.correct ? "correct" : "wrong") : "neutral"}
              revealProgress={revealProgress}
              enterFrame={16 + i * 6}
              frame={frame}
              fps={fps}
              isLight={isLight}
            />
          ))}
        </div>

        {/* Reveal label */}
        <div style={{
          marginTop: 24,
          opacity: revealProgress,
          display: "flex",
          alignItems: "center",
          gap: 10,
          height: 32,
        }}>
          <span style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.correct,
            letterSpacing: "0.02em",
          }}>
            ✓ Richtig: {ANSWER_LABELS[scene.correct]}
          </span>
        </div>
      </div>
    </div>
  );
};
