import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import sharp, { FitEnum, KernelEnum } from "sharp";
import { unauthorized } from "@/lib/apiErrors";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_SIZE_MB = 25;

const presets = {
  product: { width: 1200, height: 1200, fit: "cover", targetKb: 180, quality: 84 },
  hero: { width: 1920, height: 1080, fit: "cover", targetKb: 320, quality: 82 },
  content: { width: 1200, height: 0, fit: "inside", targetKb: 220, quality: 84 },
  logo: { width: 512, height: 512, fit: "contain", targetKb: 80, quality: 88 },
  custom: { width: 1200, height: 1200, fit: "inside", targetKb: 200, quality: 84 },
};

type PresetKey = keyof typeof presets;
type OutputFormat = "webp" | "jpeg" | "png" | "avif";
type Fit = "cover" | "contain" | "inside" | "fill";
type Position = "center" | "top" | "bottom" | "left" | "right";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function numberFromForm(value: FormDataEntryValue | null, fallback: number) {
  if (value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function stringFromForm<T extends string>(
  value: FormDataEntryValue | null,
  allowed: readonly T[],
  fallback: T
) {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function safeFileBase(filename: string) {
  const name = filename.replace(/\.[^.]+$/, "");
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "gorsel"
  );
}

function normalizeColor(value: FormDataEntryValue | null) {
  const color = typeof value === "string" ? value.trim() : "";
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#ffffff";
}

async function renderImage(options: {
  buffer: Buffer;
  width: number;
  height: number;
  fit: Fit;
  position: Position;
  format: OutputFormat;
  quality: number;
  enhance: boolean;
  background: string;
}) {
  let pipeline = sharp(options.buffer, {
    failOn: "none",
    animated: false,
    limitInputPixels: 80_000_000,
  }).rotate();

  if (options.enhance) {
    pipeline = pipeline.normalize().sharpen({ sigma: 0.75, m1: 0.7, m2: 1.1 });
  }

  if (options.width > 0 || options.height > 0) {
    pipeline = pipeline.resize({
      width: options.width > 0 ? options.width : undefined,
      height: options.height > 0 ? options.height : undefined,
      fit: options.fit as keyof FitEnum,
      position: options.position,
      withoutEnlargement: options.fit !== "fill",
      kernel: "lanczos3" as keyof KernelEnum,
      background: options.background,
    });
  }

  if (options.format === "jpeg") {
    return pipeline
      .flatten({ background: options.background })
      .jpeg({ quality: options.quality, mozjpeg: true, progressive: true })
      .toBuffer();
  }

  if (options.format === "png") {
    return pipeline
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
        palette: true,
        quality: options.quality,
      })
      .toBuffer();
  }

  if (options.format === "avif") {
    return pipeline.avif({ quality: options.quality, effort: 7 }).toBuffer();
  }

  return pipeline
    .webp({ quality: options.quality, effort: 6, smartSubsample: true })
    .toBuffer();
}

async function optimizeToTarget(options: {
  buffer: Buffer;
  width: number;
  height: number;
  fit: Fit;
  position: Position;
  format: OutputFormat;
  quality: number;
  targetKb: number;
  enhance: boolean;
  background: string;
}) {
  const targetBytes = clamp(options.targetKb, 20, 2500) * 1024;
  let quality = clamp(options.quality, 35, 95);
  let width = clamp(options.width, 0, 5000);
  let height = clamp(options.height, 0, 5000);

  let output = await renderImage({ ...options, width, height, quality });

  for (let attempt = 0; attempt < 16 && output.length > targetBytes; attempt += 1) {
    if (quality > 50 && options.format !== "png") {
      quality -= 6;
    } else if (quality > 45 && options.format === "png") {
      quality -= 5;
    } else if (width > 480 || height > 480) {
      width = width > 0 ? Math.max(480, Math.round(width * 0.9)) : width;
      height = height > 0 ? Math.max(480, Math.round(height * 0.9)) : height;
    } else {
      break;
    }

    output = await renderImage({ ...options, width, height, quality });
  }

  return { output, quality, width, height };
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return jsonError("Dosya bulunamadı.");
    if (!ALLOWED_TYPES.includes(file.type)) {
      return jsonError("Sadece JPG, PNG, WebP, AVIF ve GIF yükleyebilirsiniz.");
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return jsonError(`Dosya boyutu ${MAX_SIZE_MB} MB'dan büyük olamaz.`);
    }

    const presetKey = stringFromForm(
      formData.get("preset"),
      ["product", "hero", "content", "logo", "custom"] as const,
      "product"
    ) as PresetKey;
    const preset = presets[presetKey];

    const format = stringFromForm(
      formData.get("format"),
      ["webp", "jpeg", "png", "avif"] as const,
      "webp"
    );
    const fit = stringFromForm(
      formData.get("fit"),
      ["cover", "contain", "inside", "fill"] as const,
      preset.fit as Fit
    );
    const position = stringFromForm(
      formData.get("position"),
      ["center", "top", "bottom", "left", "right"] as const,
      "center"
    );
    const width = clamp(numberFromForm(formData.get("width"), preset.width), 0, 5000);
    const height = clamp(numberFromForm(formData.get("height"), preset.height), 0, 5000);
    const targetKb = clamp(numberFromForm(formData.get("targetKb"), preset.targetKb), 20, 2500);
    const quality = clamp(numberFromForm(formData.get("quality"), preset.quality), 35, 95);
    const enhance = formData.get("enhance") === "true";
    const background = normalizeColor(formData.get("background"));

    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer, {
      failOn: "none",
      animated: false,
      limitInputPixels: 80_000_000,
    }).metadata();

    if (!metadata.width || !metadata.height) {
      return jsonError("Görsel okunamadı. Lütfen geçerli bir görsel yükleyin.");
    }

    const optimized = await optimizeToTarget({
      buffer,
      width,
      height,
      fit,
      position,
      format,
      quality,
      targetKb,
      enhance,
      background,
    });
    const outputMetadata = await sharp(optimized.output).metadata();

    const filename = `${safeFileBase(file.name)}-${Date.now()}.${format}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "optimized");
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), optimized.output);

    return NextResponse.json({
      original: {
        filename: file.name,
        size: file.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      },
      optimized: {
        filename,
        url: `/uploads/optimized/${filename}`,
        size: optimized.output.length,
        width: outputMetadata.width,
        height: outputMetadata.height,
        format,
        quality: optimized.quality,
        compressionRatio:
          file.size > 0
            ? Math.max(0, Math.round((1 - optimized.output.length / file.size) * 100))
            : 0,
      },
    });
  } catch (error) {
    console.error("Image optimize error:", error);
    return NextResponse.json(
      { error: "Görsel optimize edilirken hata oluştu. Dosyayı ve ayarları kontrol edin." },
      { status: 500 }
    );
  }
}
