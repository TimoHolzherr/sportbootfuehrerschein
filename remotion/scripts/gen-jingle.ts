#!/usr/bin/env ts-node
/**
 * Generates a short intro jingle using fal.ai music generation.
 * Output: public/audio/jingle-intro.mp3 (or .wav)
 *
 * Usage: npm run gen:jingle
 */
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as dotenv from "dotenv";
import { fal } from "@fal-ai/client";

dotenv.config({ path: path.join(__dirname, "../.env") });

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("Missing FAL_KEY in .env");
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

const OUT_PATH = path.resolve(__dirname, "../public/audio/jingle-intro.wav");

const PROMPT =
  "Short nautical intro jingle, 8 seconds. Upbeat, warm, friendly. " +
  "Acoustic guitar strum with a light brass accent, ocean vibes. " +
  "Podcast intro style. Natural fade-out ending. No vocals. No abrupt cut.";

async function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => file.close(() => resolve()));
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async () => {
  if (fs.existsSync(OUT_PATH)) {
    console.log("Jingle already exists:", OUT_PATH);
    console.log("Delete it to regenerate.");
    process.exit(0);
  }

  console.log("Generating jingle via fal.ai (stable-audio)...");
  console.log(`Prompt: ${PROMPT}`);

  const result = await fal.subscribe("fal-ai/stable-audio", {
    input: {
      prompt: PROMPT,
      seconds_total: 10,
      steps: 100,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS" && update.logs?.length) {
        const last = update.logs[update.logs.length - 1];
        process.stdout.write(`\r  ${last.message}`);
      }
    },
  }) as { data: { audio_file: { url: string } } };

  console.log("\n  Audio URL:", result.data.audio_file.url);
  console.log("  Downloading...");

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  await downloadFile(result.data.audio_file.url, OUT_PATH);

  console.log(`✓ Jingle saved: ${OUT_PATH}`);
})();
