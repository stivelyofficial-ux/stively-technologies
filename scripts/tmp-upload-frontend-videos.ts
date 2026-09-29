import { writeFileSync, existsSync, readFileSync } from "fs";
import cloudinary from "../src/lib/cloudinary";
import type { UploadApiOptions, UploadApiResponse } from "cloudinary";

const RESULTS_PATH = "scripts/tmp-video-upload-results.json";

function uploadLarge(path: string, options: UploadApiOptions): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(path, options, (error, result) => {
      if (error || !result) {
        reject(error ?? new Error("Cloudinary upload_large returned no result"));
        return;
      }
      resolve(result);
    });
  });
}

const DIR = "private/Front-End-development/videos";

const MAP: { file: string; lectureId: string }[] = [
  { file: "Lecture1-1.mp4", lectureId: "1-1" },
  { file: "Lecture1-2.mp4", lectureId: "1-2" },
  { file: "Lecture-2.1.mp4", lectureId: "2-1" },
  { file: "Lecture-2.2.mp4", lectureId: "2-2" },
  { file: "Lecture2.3.mp4", lectureId: "2-3" },
  { file: "Lecture2-4.mp4", lectureId: "2-4" },
  { file: "Lecture3-1.mp4", lectureId: "3-1" },
  { file: "Lecture3-2.mp4", lectureId: "3-2" },
  { file: "Lecture3-3.mp4", lectureId: "3-3" },
  { file: "Lecture3-4-compressed.mp4", lectureId: "3-4" },
  { file: "Lecture3-5-compressed.mp4", lectureId: "3-5" },
  { file: "Lecture3-6.mp4", lectureId: "3-6" },
  { file: "Lecture3-7-compressed.mp4", lectureId: "3-7" },
  { file: "Lecture4.1.mp4", lectureId: "4-1" },
  { file: "Lecture4.2.mp4", lectureId: "4-2" },
  { file: "Lecture4.3.mp4", lectureId: "4-3" },
  { file: "Lecture4.4.mp4", lectureId: "4-4" },
  { file: "Lecture4.5.mp4", lectureId: "4-5" },
  { file: "Lecture4.6.mp4", lectureId: "4-6" },
];

async function main() {
  const results: Record<string, string> = existsSync(RESULTS_PATH) ? JSON.parse(readFileSync(RESULTS_PATH, "utf-8")) : {};
  for (const { file, lectureId } of MAP) {
    if (results[lectureId]) {
      console.log(`Skipping ${file} (lecture ${lectureId}) - already uploaded.`);
      continue;
    }
    const path = `${DIR}/${file}`;
    console.log(`Uploading ${file} -> lecture ${lectureId} ...`);
    const start = Date.now();
    const result = await uploadLarge(path, {
      resource_type: "video",
      folder: "stively/course-videos",
      public_id: `frontend-lecture-${lectureId}`,
      chunk_size: 6_000_000,
    });
    const seconds = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  done in ${seconds}s -> ${result.secure_url}`);
    results[lectureId] = result.secure_url;
    writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
  }
  console.log("ALL_DONE");
}
main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
