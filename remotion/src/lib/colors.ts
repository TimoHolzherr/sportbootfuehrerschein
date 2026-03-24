export const COLORS = {
  // Backgrounds
  navy: "#0A2342",
  navyLight: "#0E2E56",
  navyCard: "rgba(255,255,255,0.08)",

  // Accents
  ocean: "#1E90FF",
  highlight: "#F5A623",
  highlightDim: "rgba(245,166,35,0.15)",

  // Answer states
  correct: "#2ECC71",
  correctBg: "rgba(46,204,113,0.32)",
  incorrect: "#E74C3C",
  incorrectBg: "rgba(231,76,60,0.08)",

  // Text
  white: "#FFFFFF",
  whiteAlpha70: "rgba(255,255,255,0.7)",
  whiteAlpha40: "rgba(255,255,255,0.4)",

  // Utility
  border: "rgba(255,255,255,0.15)",
  shadow: "0 4px 24px rgba(0,0,0,0.4)",
} as const;

// Gradient backgrounds
export const GRADIENTS = {
  navyDeep: "linear-gradient(160deg, #0A2342 0%, #0E2E56 50%, #0A1F38 100%)",
  navyQuestion: "linear-gradient(180deg, #081C36 0%, #0A2342 100%)",
  navyExplanation: "linear-gradient(160deg, #0A2342 0%, #0D2B4E 100%)",
} as const;
