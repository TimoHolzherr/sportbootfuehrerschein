#!/usr/bin/env ts-node
/**
 * Generates background images for explanation scenes that have an `image_prompt` field.
 * Saves to public/{scene.background} and updates the YAML.
 * Usage: npm run gen:images -- --episode stories/sbf-see-01-schiffsfuehrer.yaml
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
  console.error("Usage: npm run gen:images -- --episode stories/sbf-see-01-schiffsfuehrer.yaml");
  process.exit(1);
}

const episodePath = path.resolve(episodeArg);
const raw = yaml.load(fs.readFileSync(episodePath, "utf8")) as Record<string, unknown> & {
  scenes: Array<{ id: string; type: string; image_prompt?: string; background?: string }>;
};

async function generateImage(prompt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1536x1024",  // closest to 16:9 landscape for YouTube
      quality: "high",
      output_format: "png",
    });

    const req = https.request(
      {
        hostname: "api.openai.com",
        path: "/v1/images/generations",
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
            reject(new Error(`OpenAI image error ${res.statusCode}: ${buf.toString()}`));
            return;
          }
          const json = JSON.parse(buf.toString()) as {
            data: Array<{ b64_json?: string; url?: string }>;
          };
          const b64 = json.data[0]?.b64_json;
          if (!b64) {
            reject(new Error("No b64_json in response: " + buf.toString().slice(0, 200)));
            return;
          }
          resolve(Buffer.from(b64, "base64"));
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  let changed = false;

  for (const scene of raw.scenes) {
    if (!scene.image_prompt) continue;

    // Auto-derive background path from scene id if not set
    if (!scene.background) {
      const episodeId = (raw as Record<string, unknown>).id as string;
      scene.background = `images/generated/${episodeId}/${scene.id}.png`;
      changed = true;
    }

    const outPath = path.resolve(path.dirname(episodePath), "../public", scene.background);
    if (fs.existsSync(outPath)) {
      console.log(`Scene ${scene.id}: image already exists, skipping`);
      continue;
    }

    console.log(`Scene ${scene.id}: generating image...`);
    console.log(`  Prompt: ${scene.image_prompt.slice(0, 80)}...`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    const buf = await generateImage(scene.image_prompt);
    fs.writeFileSync(outPath, buf);
    console.log(`  → ${path.relative(process.cwd(), outPath)} (${(buf.length / 1024).toFixed(0)} KB)`);
  }

  if (changed) {
    fs.writeFileSync(episodePath, yaml.dump(raw, { lineWidth: 120 }));
    console.log(`\n✓ YAML updated with background paths`);
  }

  console.log("\nFertig.");
})();
