import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { IntroScene as IntroSceneType } from "../../lib/schema";
import { COLORS, GRADIENTS } from "../../lib/colors";

interface Props {
  scene: IntroSceneType;
}

export const IntroScene: React.FC<Props> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const logoScale = spring({ fps, frame, config: { stiffness: 80, damping: 20 } });

  const titleSlide = interpolate(frame, [8, 28], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = interpolate(frame, [8, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const metaOpacity = interpolate(frame, [22, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: GRADIENTS.navyDeep,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeIn,
      }}
    >
      {/* Decorative top stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background: `linear-gradient(90deg, ${COLORS.ocean}, ${COLORS.highlight})`,
        }}
      />

      {/* Channel name */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          marginBottom: 40,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 32,
            fontWeight: 700,
            color: COLORS.ocean,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          ⚓ Klar zum Entern
        </span>
      </div>

      {/* Certificate badge */}
      <div
        style={{
          background: COLORS.ocean,
          borderRadius: 8,
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 28,
          paddingRight: 28,
          marginBottom: 32,
          opacity: titleOpacity,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 26,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: "0.06em",
          }}
        >
          {scene.certificate}
        </span>
      </div>

      {/* Topic title */}
      <div
        style={{
          transform: `translateY(${titleSlide}px)`,
          opacity: titleOpacity,
          textAlign: "center",
          paddingLeft: 120,
          paddingRight: 120,
          marginBottom: 48,
        }}
      >
        <h1
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 72,
            fontWeight: 800,
            color: COLORS.white,
            lineHeight: 1.15,
            margin: 0,
            textShadow: COLORS.shadow,
          }}
        >
          {scene.topic}
        </h1>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 80,
          height: 3,
          background: COLORS.highlight,
          borderRadius: 2,
          marginBottom: 40,
          opacity: metaOpacity,
        }}
      />

      {/* Meta info */}
      <div style={{ opacity: metaOpacity, textAlign: "center" }}>
        <p
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 28,
            color: COLORS.whiteAlpha70,
            margin: 0,
          }}
        >
          Episode {scene.episode} · {scene.question_count}{" "}
          {scene.question_count === 1 ? "Frage" : "Fragen"}
        </p>
      </div>

      {/* Decorative bottom stripe */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${COLORS.highlight}, ${COLORS.ocean})`,
        }}
      />
    </div>
  );
};
