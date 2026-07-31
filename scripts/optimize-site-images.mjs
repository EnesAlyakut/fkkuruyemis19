import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/images");
const supported = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(fullPath) : fullPath;
    })
  );
  return files.flat();
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function optimizeImage(file) {
  const extension = path.extname(file).toLowerCase();
  if (!supported.has(extension)) return null;

  const original = await fs.readFile(file);
  if (original.byteLength < 80 * 1024) return { before: original.byteLength, after: original.byteLength, changed: false };

  let pipeline = sharp(original, { failOn: "error" }).rotate();
  if (extension === ".jpg" || extension === ".jpeg") {
    pipeline = pipeline.jpeg({ quality: 86, mozjpeg: true, progressive: true, chromaSubsampling: "4:4:4" });
  } else if (extension === ".webp") {
    pipeline = pipeline.webp({ quality: 86, effort: 6, smartSubsample: true });
  } else {
    pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 });
  }

  const optimized = await pipeline.toBuffer();
  await sharp(optimized).metadata();

  if (optimized.byteLength >= original.byteLength * 0.99) {
    return { before: original.byteLength, after: original.byteLength, changed: false };
  }

  const temporary = `${file}.optimized`;
  await fs.writeFile(temporary, optimized);
  await fs.copyFile(temporary, file);
  await fs.unlink(temporary);
  return { before: original.byteLength, after: optimized.byteLength, changed: true };
}

const files = await walk(root);
let before = 0;
let after = 0;
let changed = 0;

for (const file of files) {
  const result = await optimizeImage(file);
  if (!result) continue;
  before += result.before;
  after += result.after;
  if (result.changed) changed += 1;
}

console.log(
  JSON.stringify(
    {
      scanned: files.filter((file) => supported.has(path.extname(file).toLowerCase())).length,
      changed,
      before: formatBytes(before),
      after: formatBytes(after),
      saved: formatBytes(before - after),
      reductionPercent: Number((((before - after) / before) * 100).toFixed(1)),
    },
    null,
    2
  )
);
