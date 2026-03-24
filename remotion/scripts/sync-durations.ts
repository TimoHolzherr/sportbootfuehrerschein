#!/usr/bin/env ts-node
/**
 * Reads actual MP3 durations and updates scene duration_ms in the episode YAML.
 * Adds lead-in + tail padding around each audio clip.
 * Usage: npm run sync:durations -- --episode stories/sbf-see-01-schiffsfuehrer.yaml
 *        npm run sync:durations -- --all
 */
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { parseFile } from "music-metadata";

const LEAD_IN_MS = 400;         // silence before voice starts (matches AUDIO_LEAD_IN_FRAMES in EpisodeVideo)
const TAIL_MS = 800;            // breathing room after speech ends
const INCOMING_TRANSITION_APPROX_MS = 300; // typical preceding scene transition (question→explanation)
const BULLET_GAP_MS = 150;      // pause between consecutive bullet audio clips

async function getAudioDurationMs(filePath: string): Promise<number | null> {
  try {
    const meta = await parseFile(filePath);
    const secs = meta.format.duration;
    return secs != null ? Math.round(secs * 1000) : null;
  } catch {
    return null;
  }
}

async function syncEpisode(episodePath: string) {
  const raw = yaml.load(fs.readFileSync(episodePath, "utf8")) as Record<string, unknown> & {
    scenes: Array<{
      id: string;
      type?: string;
      audio?: string;
      duration_ms?: number;
      reveal_ms?: number;
      body_scripts?: string[];
      body_audio_offsets_ms?: number[];
    }>;
  };
  let changed = false;

  for (const scene of raw.scenes) {
    if (!scene.audio) continue;
    const audioPath = path.resolve(path.dirname(episodePath), "../public", scene.audio);
    if (!fs.existsSync(audioPath)) continue;

    const audioDurationMs = await getAudioDurationMs(audioPath);
    if (audioDurationMs == null) continue;

    // ── Per-bullet offsets for explanation scenes ─────────────────────────────
    if (scene.type === "explanation" && scene.body_scripts?.length) {
      const audioBase = path.resolve(path.dirname(episodePath), "../public", scene.audio).replace(/\.mp3$/, "");
      const bulletOffsets: number[] = [];

      // First bullet starts after: incoming-transition + lead-in + main-script + small gap
      let cursor = INCOMING_TRANSITION_APPROX_MS + LEAD_IN_MS + audioDurationMs + 200;

      let allBulletsFound = true;
      for (let i = 0; i < scene.body_scripts.length; i++) {
        bulletOffsets.push(cursor);
        const bulletPath = `${audioBase}-b${i}.mp3`;
        const bulletDuration = await getAudioDurationMs(bulletPath);
        if (bulletDuration == null) { allBulletsFound = false; break; }
        cursor += bulletDuration + BULLET_GAP_MS;
      }

      if (allBulletsFound && bulletOffsets.length === scene.body_scripts.length) {
        const offsetsChanged =
          !scene.body_audio_offsets_ms ||
          scene.body_audio_offsets_ms.length !== bulletOffsets.length ||
          bulletOffsets.some((v, i) => Math.abs(v - (scene.body_audio_offsets_ms![i] ?? 0)) > 100);

        if (offsetsChanged) {
          console.log(`  ${scene.id}: updating body_audio_offsets_ms [${bulletOffsets.map(ms => ms + "ms").join(", ")}]`);
          scene.body_audio_offsets_ms = bulletOffsets;
          changed = true;
        }

        // Scene must cover all bullet audio + tail
        // cursor is at: last_offset + last_bullet_duration + BULLET_GAP_MS
        // so last bullet ends at cursor - BULLET_GAP_MS
        const neededDuration = cursor - BULLET_GAP_MS + TAIL_MS;
        const current = scene.duration_ms ?? 0;
        if (Math.abs(neededDuration - current) > 100) {
          console.log(`  ${scene.id}: ${current}ms → ${neededDuration}ms (covers all bullets)`);
          scene.duration_ms = neededDuration;
          changed = true;
        }
        continue; // skip default duration update below
      }
    }

    // ── Default: size scene from main audio ───────────────────────────────────
    const needed = LEAD_IN_MS + audioDurationMs + TAIL_MS;
    const current = scene.duration_ms ?? 0;

    if (Math.abs(needed - current) > 100) {
      console.log(`  ${scene.id}: ${current}ms → ${needed}ms (audio: ${audioDurationMs}ms)`);
      scene.duration_ms = needed;
      changed = true;
    }

    // For question scenes: set reveal_ms = just after voice finishes reading
    if (scene.type === "question") {
      const newReveal = LEAD_IN_MS + audioDurationMs + 600; // 600ms pause after reading
      const curReveal = scene.reveal_ms ?? 0;
      if (Math.abs(newReveal - curReveal) > 100) {
        console.log(`  ${scene.id}: reveal_ms ${curReveal}ms → ${newReveal}ms`);
        scene.reveal_ms = newReveal;
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(episodePath, yaml.dump(raw, { lineWidth: 120 }));
    console.log(`  ✓ gespeichert: ${path.basename(episodePath)}`);
  } else {
    console.log(`  ${path.basename(episodePath)}: bereits synchron`);
  }
}

(async () => {
  const allFlag = process.argv.includes("--all");
  const episodeArg =
    process.argv.find((a) => a.startsWith("--episode="))?.slice(10) ??
    (process.argv.includes("--episode")
      ? process.argv[process.argv.indexOf("--episode") + 1]
      : null);

  const storiesDir = path.join(__dirname, "../stories");

  const files = allFlag
    ? fs
        .readdirSync(storiesDir)
        .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
        .map((f) => path.join(storiesDir, f))
    : episodeArg
    ? [path.resolve(episodeArg)]
    : [];

  if (files.length === 0) {
    console.error(
      "Usage: npm run sync:durations -- --episode stories/foo.yaml  ODER  --all"
    );
    process.exit(1);
  }

  for (const f of files) {
    console.log(`\n${path.basename(f)}`);
    await syncEpisode(f);
  }
})();
