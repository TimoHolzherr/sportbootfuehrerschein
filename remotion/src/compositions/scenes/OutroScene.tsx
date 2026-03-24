import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { OutroScene as OutroSceneType } from "../../lib/schema";
import { COLORS, GRADIENTS } from "../../lib/colors";

interface Props {
  scene: OutroSceneType;
}

export const OutroScene: React.FC<Props> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const scale = spring({ fps, frame, from: 0.95, to: 1, config: { stiffness: 60, damping: 18 } });

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
        paddingLeft: 120,
        paddingRight: 120,
      }}
    >
      {/* Top stripe */}
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

      {/* Anchor icon */}
      <div
        style={{
          transform: `scale(${scale})`,
          marginBottom: 32,
          fontSize: 72,
        }}
      >
        ⚓
      </div>

      {/* "Das habt ihr gelernt" */}
      <p
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 28,
          fontWeight: 600,
          color: COLORS.ocean,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          margin: 0,
          marginBottom: 16,
        }}
      >
        Das habt ihr gelernt
      </p>

      {/* Topic */}
      <h2
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 56,
          fontWeight: 800,
          color: COLORS.white,
          textAlign: "center",
          margin: 0,
          marginBottom: 48,
          lineHeight: 1.2,
        }}
      >
        {scene.topic}
      </h2>

      {/* Summary points */}
      {scene.summary_points && scene.summary_points.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            width: "100%",
            maxWidth: 1200,
            marginBottom: 56,
          }}
        >
          {scene.summary_points.map((point, i) => {
            const pointOpacity = interpolate(frame, [20 + i * 8, 34 + i * 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  opacity: pointOpacity,
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: COLORS.correct,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      color: COLORS.white,
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    fontSize: 32,
                    color: COLORS.white,
                    lineHeight: 1.4,
                  }}
                >
                  {point}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <div
        style={{
          background: COLORS.ocean,
          borderRadius: 12,
          paddingTop: 18,
          paddingBottom: 18,
          paddingLeft: 48,
          paddingRight: 48,
          marginBottom: 24,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 30,
            fontWeight: 700,
            color: COLORS.white,
          }}
        >
          🔔 Abonnieren für mehr Lernvideos
        </span>
      </div>

      {/* Channel */}
      <p
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 24,
          color: COLORS.whiteAlpha40,
          margin: 0,
          letterSpacing: "0.05em",
        }}
      >
        Klar zum Entern · youtube.com/@KlarzumEntern
      </p>

      {/* Bottom stripe */}
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
