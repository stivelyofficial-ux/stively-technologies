/**
 * One-off: uploads the six Module 4 lecture videos (private/Front-End-development/videos/Lecture4.N.mp4)
 * to Cloudinary and records the URLs in scripts/frontend-module-4-video-urls.json, which
 * scripts/add-frontend-module-5.ts then reads. Safe to re-run: finished uploads are skipped.
 * Run with the env loaded:  set -a; . ./.env; set +a; npx tsx scripts/upload-frontend-module-4-videos.ts
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import cloudinary from "../src/lib/cloudinary";
import type { UploadApiOptions, UploadApiResponse } from "cloudinary";

const RESULTS_PATH = "scripts/frontend-module-4-video-urls.json";
const DIR = "private/Front-End-development/videos";

function uploadLarge(path: string, options: UploadApiOptions): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(path, options, (error, result) => {
      if (error || !result)
        reject(error ?? new Error("Cloudinary upload_large returned no result"));
      else resolve(result);
    });
  });
}

async function main() {
  const results: Record<string, string> = existsSync(RESULTS_PATH)
    ? JSON.parse(readFileSync(RESULTS_PATH, "utf-8"))
    : {};
  for (const n of [1, 2, 3, 4, 5, 6]) {
    const id = `4-${n}`;
    if (results[id]) {
      console.log(`Skipping 4.${n} - already uploaded.`);
      continue;
    }
    // The compressor writes each file under a .part name and renames it when finished, so existence means complete.
    while (!existsSync(`${DIR}/Lecture4.${n}-compressed.mp4`)) {
      console.log(`Waiting for Lecture4.${n}-compressed.mp4 to finish compressing ...`);
      await new Promise((r) => setTimeout(r, 15000));
    }
    console.log(`Uploading Lecture4.${n}-compressed.mp4 ...`);
    const started = Date.now();
    // Big files over a home connection drop now and then (ECONNRESET) - retry the file a few times before giving up.
    let result: UploadApiResponse | undefined;
    for (let attempt = 1; attempt <= 8 && !result; attempt++) {
      try {
        result = await uploadLarge(`${DIR}/Lecture4.${n}-compressed.mp4`, {
          resource_type: "video",
          folder: "stively/course-videos",
          public_id: `frontend-lecture-${id}`,
          chunk_size: 5_500_000,
          timeout: 600_000, // slow uplinks: give each chunk up to 10 minutes instead of the 60s default
        });
      } catch (error) {
        console.log(`  attempt ${attempt} failed: ${String((error as Error).message ?? error)}`);
        if (attempt === 8) throw error;
        await new Promise((r) => setTimeout(r, 15000));
      }
    }
    if (!result) throw new Error("upload produced no result");
    console.log(`  done in ${((Date.now() - started) / 1000).toFixed(0)}s -> ${result.secure_url}`);
    results[id] = result.secure_url;
    writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
  }
  console.log("ALL_DONE");
}

main().catch((error) => {
  console.error("Upload failed:", error);
  process.exit(1);
});
