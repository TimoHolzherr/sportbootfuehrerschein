import { z } from "zod";

export const TransitionSchema = z.object({
  type: z.enum(["fade"]),
  duration_ms: z.number().positive().default(400),
});

// ── Scene base ────────────────────────────────────────────────────────────────

const BaseSceneSchema = z.object({
  id: z.string(),
  duration_ms: z.number().positive(),
  audio: z.string().optional(),
  script: z.string().optional(),  // source text for TTS generation
  transition: TransitionSchema.nullable().optional(),
});

// ── Intro scene ───────────────────────────────────────────────────────────────
// Full-screen title card: certificate label + topic title + meta info

export const IntroSceneSchema = BaseSceneSchema.extend({
  type: z.literal("intro"),
  certificate: z.string(),          // e.g. "SBF See"
  topic: z.string(),                 // e.g. "Pflichten des Schiffsführers"
  question_count: z.number().int().positive(),
  episode: z.number().int().positive(),
});

// ── Question scene ────────────────────────────────────────────────────────────
// Shows question + 4 answer cards, then reveals the correct answer

export const QuestionSceneSchema = BaseSceneSchema.extend({
  type: z.literal("question"),
  question_number: z.number().int().positive(),
  question_total: z.number().int().positive(),
  question: z.string(),
  answers: z.array(z.string()).length(4),
  correct: z.number().int().min(0).max(3), // index into answers[]
  reveal_ms: z.number().positive().default(5000),
  background: z.string().optional(),        // path relative to public/
  catalog_number: z.number().int().positive().optional(), // question number in the official catalog
});

// ── Explanation scene ─────────────────────────────────────────────────────────
// Split layout: left = question + answers (for visual reference), right = explanation text

export const ExplanationSceneSchema = BaseSceneSchema.extend({
  type: z.literal("explanation"),
  headline: z.string().optional(),
  // Body supports bullet points: lines starting with "- " become bullet items.
  // A line starting with "💡" or "Merkhilfe:" gets highlighted treatment.
  body: z.string().optional(),
  // Per-bullet narration scripts (one entry per body bullet/tip).
  // gen:audio generates {sceneId}-b{i}.mp3 for each.
  body_scripts: z.array(z.string()).optional(),
  // Start time (ms from scene frame 0) when each bullet's audio begins.
  // Computed by sync:durations from actual bullet audio durations.
  body_audio_offsets_ms: z.array(z.number()).optional(),
  // Optional background image shown fullscreen at the start of the scene
  background: z.string().optional(),        // path relative to public/
  image_prompt: z.string().optional(),      // prompt for gen:images
  image_duration_ms: z.number().positive().default(4000), // how long to show image before split
  // Reference the question for the left-side visual panel
  question: z.string().optional(),
  answers: z.array(z.string()).optional(),
  correct: z.number().int().min(0).max(3).optional(),
  catalog_number: z.number().int().positive().optional(),
});

// ── Outro scene ───────────────────────────────────────────────────────────────
// End card with topic summary and channel branding

export const OutroSceneSchema = BaseSceneSchema.extend({
  type: z.literal("outro"),
  topic: z.string(),
  summary_points: z.array(z.string()).optional(),
});

// ── Union & story ─────────────────────────────────────────────────────────────

export const SceneSchema = z.discriminatedUnion("type", [
  IntroSceneSchema,
  QuestionSceneSchema,
  ExplanationSceneSchema,
  OutroSceneSchema,
]);

export const EpisodeSchema = z.object({
  id: z.string(),
  fps: z.number().int().positive().default(30),
  voice: z.string().default("nova"),       // OpenAI TTS voice
  jingle: z.string().optional(),           // path relative to public/, plays over intro
  jingle_voice: z.string().optional(),     // TTS voice-over played over jingle
  music: z.string().optional(),
  music_volume: z.number().min(0).max(1).default(0.08),
  scenes: z.array(SceneSchema).min(1),
});

// ── TypeScript types ──────────────────────────────────────────────────────────

export type Transition = z.infer<typeof TransitionSchema>;
export type IntroScene = z.infer<typeof IntroSceneSchema>;
export type QuestionScene = z.infer<typeof QuestionSceneSchema>;
export type ExplanationScene = z.infer<typeof ExplanationSceneSchema>;
export type OutroScene = z.infer<typeof OutroSceneSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type Episode = z.infer<typeof EpisodeSchema>;
