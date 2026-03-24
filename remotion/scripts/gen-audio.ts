#!/usr/bin/env ts-node
/**
 * Generates OpenAI TTS audio for each scene that has a `script` field.
 * Usage: npm run gen:audio -- --episode stories/sbf-see-01-schiffsfuehrer.yaml
 *
 * Supported OpenAI voices: alloy, echo, fable, nova, onyx, shimmer
 * For German, nova (female) and onyx (male) work well.
 */
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as https from "https";
import * as dotenv from "dotenv";
import { EpisodeSchema } from "../src/lib/schema";

dotenv.config({ path: path.join(__dirname, "../.env") });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env");
  process.exit(1);
}

const episodeArg =
  process.argv.find((a) => a.startsWith("--episode="))?.slice(10) ??
  (process.argv.includes("--episode")
    ? process.argv[process.argv.indexOf("--episode") + 1]
    : null);

if (!episodeArg) {
  console.error("Usage: npm run gen:audio -- --episode stories/sbf-see-01-schiffsfuehrer.yaml");
  process.exit(1);
}

const episodePath = path.resolve(episodeArg);
const raw = yaml.load(fs.readFileSync(episodePath, "utf8")) as unknown;
const episode = EpisodeSchema.parse(raw);

async function generateAudio(text: string, voice: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "tts-1-hd",
      input: text,
      voice,
    });

    const req = https.request(
      {
        hostname: "api.openai.com",
        path: "/v1/audio/speech",
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const buf = Buffer.concat(chunks);
          if (res.statusCode !== 200) {
            reject(new Error(`OpenAI TTS error ${res.statusCode}: ${buf.toString()}`));
          } else {
            resolve(buf);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  const voice = episode.voice ?? "nova";
  console.log(`Episode: ${episode.id} | Voice: ${voice}`);

  // ── Jingle voice-over ────────────────────────────────────────────────────────
  if (episode.jingle_voice_script && episode.jingle_voice) {
    const jingleVoicePath = path.resolve(__dirname, "../public", episode.jingle_voice);
    if (fs.existsSync(jingleVoicePath)) {
      console.log(`Jingle voice: exists, skipping`);
    } else {
      console.log(`Jingle voice: generating...`);
      fs.mkdirSync(path.dirname(jingleVoicePath), { recursive: true });
      const buf = await generateAudio(episode.jingle_voice_script, voice);
      fs.writeFileSync(jingleVoicePath, buf);
      console.log(`  → ${path.relative(process.cwd(), jingleVoicePath)} (${(buf.length / 1024).toFixed(1)} KB)`);
    }
  }

  for (const scene of episode.scenes) {
    // ── Main scene audio ──────────────────────────────────────────────────────
    if (scene.script) {
      if (!scene.audio) {
        console.warn(`Scene ${scene.id}: has script but no audio path — skipping`);
      } else {
        const outPath = path.resolve(__dirname, "../public", scene.audio);
        if (fs.existsSync(outPath)) {
          console.log(`Scene ${scene.id}: audio exists, skipping`);
        } else {
          console.log(`Scene ${scene.id}: generating main audio...`);
          fs.mkdirSync(path.dirname(outPath), { recursive: true });
          const buf = await generateAudio(scene.script, voice);
          fs.writeFileSync(outPath, buf);
          console.log(`  → ${path.relative(process.cwd(), outPath)} (${(buf.length / 1024).toFixed(1)} KB)`);
        }
      }
    }

    // ── Per-bullet audio (explanation scenes with body_scripts) ───────────────
    if (scene.type === "explanation" && scene.body_scripts?.length && scene.audio) {
      const audioBase = path.resolve(__dirname, "../public", scene.audio).replace(/\.mp3$/, "");
      for (let i = 0; i < scene.body_scripts.length; i++) {
        const bulletPath = `${audioBase}-b${i}.mp3`;
        if (fs.existsSync(bulletPath)) {
          console.log(`Scene ${scene.id} bullet ${i}: audio exists, skipping`);
          continue;
        }
        const script = scene.body_scripts[i];
        if (!script.trim()) continue;
        console.log(`Scene ${scene.id} bullet ${i}: generating...`);
        const buf = await generateAudio(script, voice);
        fs.writeFileSync(bulletPath, buf);
        console.log(`  → ${path.relative(process.cwd(), bulletPath)} (${(buf.length / 1024).toFixed(1)} KB)`);
      }
    }
  }

  console.log("\nFertig.");
})();
