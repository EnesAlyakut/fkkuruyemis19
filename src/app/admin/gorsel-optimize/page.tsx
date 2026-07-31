"use client";

import { DragEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  ImageIcon,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import toast from "react-hot-toast";

const MAX_SIZE_MB = 25;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

const presetOptions = [
  {
    value: "product",
    label: "Ürün",
    description: "Kare ürün görseli",
    width: 1200,
    height: 1200,
    fit: "cover",
    targetKb: 180,
    quality: 84,
  },
  {
    value: "hero",
    label: "Banner",
    description: "Geniş kapak alanı",
    width: 1920,
    height: 1080,
    fit: "cover",
    targetKb: 320,
    quality: 82,
  },
  {
    value: "content",
    label: "İçerik",
    description: "Blog/sayfa görseli",
    width: 1200,
    height: 0,
    fit: "inside",
    targetKb: 220,
    quality: 84,
  },
  {
    value: "logo",
    label: "Logo",
    description: "Marka görseli",
    width: 512,
    height: 512,
    fit: "contain",
    targetKb: 80,
    quality: 88,
  },
  {
    value: "custom",
    label: "Özel",
    description: "Elle ayarla",
    width: 1200,
    height: 1200,
    fit: "inside",
    targetKb: 200,
    quality: 84,
  },
];

type OptimizeResult = {
  original: {
    filename: string;
    size: number;
    width?: number;
    height?: number;
    format?: string;
  };
  optimized: {
    filename: string;
    url: string;
    size: number;
    width?: number;
    height?: number;
    format: string;
    quality: number;
    compressionRatio: number;
  };
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export default function GorselOptimizePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [settings, setSettings] = useState({
    preset: "product",
    format: "webp",
    width: 1200,
    height: 1200,
    fit: "cover",
    position: "center",
    targetKb: 180,
    quality: 84,
    enhance: true,
    background: "#ffffff",
  });

  const selectedPreset = useMemo(
    () => presetOptions.find((preset) => preset.value === settings.preset),
    [settings.preset]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validateFile = (selectedFile: File) => {
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      toast.error("Sadece JPG, PNG, WebP, AVIF veya GIF yükleyebilirsiniz.");
      return false;
    }

    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Dosya boyutu ${MAX_SIZE_MB} MB'dan büyük olamaz.`);
      return false;
    }

    return true;
  };

  const handleFile = (selectedFile?: File) => {
    if (!selectedFile || !validateFile(selectedFile)) return;

    setFile(selectedFile);
    setResult(null);
    setPreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return URL.createObjectURL(selectedFile);
    });
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    setPreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return "";
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePresetChange = (presetValue: string) => {
    const preset = presetOptions.find((item) => item.value === presetValue);
    if (!preset) return;

    setSettings((current) => ({
      ...current,
      preset: preset.value,
      width: preset.width,
      height: preset.height,
      fit: preset.fit,
      targetKb: preset.targetKb,
      quality: preset.quality,
    }));
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragActive(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const optimizeImage = async () => {
    if (!file) {
      toast.error("Önce bir görsel seçin.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      Object.entries(settings).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      const response = await fetch("/api/admin/images/optimize", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Görsel optimize edilemedi.");
      }

      setResult(data);
      toast.success("Görsel optimize edildi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = async () => {
    if (!result?.optimized.url) return;

    try {
      await navigator.clipboard.writeText(result.optimized.url);
      toast.success("Görsel URL'si kopyalandı.");
    } catch {
      toast.error("Kopyalanamadı. URL'yi elle seçip kopyalayabilirsiniz.");
    }
  };

  return (
    <div className="p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-brand-600">
          <Wand2 size={20} />
          <span className="text-sm font-semibold uppercase tracking-wider">
            Görsel Aracı
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Görsel Optimize</h1>
        <p className="max-w-3xl text-sm text-gray-500">
          Ürün, banner, logo ve içerik görsellerini kırpın, boyutlandırın,
          kaliteyi toparlayın ve hızlı açılacak hale getirin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-brand-500" />
                <h2 className="font-semibold text-gray-900">Görsel Seç</h2>
              </div>
              {file && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={13} />
                  Temizle
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                dragActive
                  ? "border-brand-400 bg-brand-50"
                  : "border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50"
              }`}
            >
              {previewUrl ? (
                <span className="relative block h-64 w-full overflow-hidden rounded-xl bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Seçilen görsel"
                    className="h-full w-full object-contain"
                  />
                </span>
              ) : (
                <>
                  <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm">
                    <ImageIcon size={26} />
                  </span>
                  <span className="font-semibold text-gray-800">
                    Görsel yüklemek için tıklayın veya sürükleyin
                  </span>
                  <span className="mt-1 text-sm text-gray-500">
                    JPG, PNG, WebP, AVIF veya GIF · maksimum {MAX_SIZE_MB} MB
                  </span>
                </>
              )}
            </button>

            {file && (
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="rounded-full bg-gray-100 px-3 py-1 font-medium">
                  {file.name}
                </span>
                <span>{formatBytes(file.size)}</span>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-brand-500" />
              <h2 className="font-semibold text-gray-900">Ayarlar</h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {presetOptions.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetChange(preset.value)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    settings.preset === preset.value
                      ? "border-brand-400 bg-brand-50 text-brand-800"
                      : "border-gray-200 hover:border-brand-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="block font-semibold">{preset.label}</span>
                  <span className="mt-1 block text-xs text-gray-500">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label>
                <span className="input-label">Format</span>
                <select
                  value={settings.format}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, format: event.target.value }))
                  }
                  className="input-field"
                >
                  <option value="webp">WebP - önerilen</option>
                  <option value="avif">AVIF - en küçük</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                </select>
              </label>

              <label>
                <span className="input-label">Kırpma</span>
                <select
                  value={settings.fit}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, fit: event.target.value }))
                  }
                  className="input-field"
                >
                  <option value="cover">Kırp ve doldur</option>
                  <option value="contain">Boşluk bırakarak sığdır</option>
                  <option value="inside">Oranı koruyarak küçült</option>
                  <option value="fill">Tam ölçüye esnet</option>
                </select>
              </label>

              <label>
                <span className="input-label">Kırpma Konumu</span>
                <select
                  value={settings.position}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, position: event.target.value }))
                  }
                  className="input-field"
                >
                  <option value="center">Orta</option>
                  <option value="top">Üst</option>
                  <option value="bottom">Alt</option>
                  <option value="left">Sol</option>
                  <option value="right">Sağ</option>
                </select>
              </label>

              <label>
                <span className="input-label">Arka Plan</span>
                <input
                  type="color"
                  value={settings.background}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, background: event.target.value }))
                  }
                  className="h-[50px] w-full rounded-xl border border-gray-200 bg-white p-2"
                />
              </label>

              <label>
                <span className="input-label">Genişlik</span>
                <input
                  type="number"
                  min={0}
                  max={5000}
                  value={settings.width}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      width: clampNumber(Number(event.target.value), 0, 5000),
                    }))
                  }
                  className="input-field"
                />
              </label>

              <label>
                <span className="input-label">Yükseklik</span>
                <input
                  type="number"
                  min={0}
                  max={5000}
                  value={settings.height}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      height: clampNumber(Number(event.target.value), 0, 5000),
                    }))
                  }
                  className="input-field"
                />
              </label>

              <label>
                <span className="input-label">Hedef KB</span>
                <input
                  type="number"
                  min={20}
                  max={2500}
                  value={settings.targetKb}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      targetKb: clampNumber(
                        Number(event.target.value),
                        20,
                        selectedPreset?.targetKb || 2500
                      ),
                    }))
                  }
                  className="input-field"
                />
              </label>

              <label>
                <span className="input-label">Kalite</span>
                <input
                  type="number"
                  min={35}
                  max={95}
                  value={settings.quality}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      quality: clampNumber(Number(event.target.value), 35, 95),
                    }))
                  }
                  className="input-field"
                />
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={settings.enhance}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, enhance: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-brand-600"
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-800">
                    Netleştir ve renkleri toparla
                  </span>
                  <span className="block text-xs text-gray-500">
                    Hafif keskinleştirme ve normalize işlemi uygular.
                  </span>
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={optimizeImage}
              disabled={loading || !file}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
              {loading ? "Optimize ediliyor..." : "Görseli Optimize Et"}
            </button>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-brand-500" />
              <h2 className="font-semibold text-gray-900">Sonuç</h2>
            </div>

            {!result ? (
              <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500">
                Optimize işleminden sonra yeni görsel, boyut bilgileri ve kullanıma hazır URL burada görünür.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.optimized.url}
                    alt="Optimize edilmiş görsel"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">Önce</p>
                    <p className="font-bold text-gray-900">
                      {formatBytes(result.original.size)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-green-50 p-3">
                    <p className="text-xs text-green-600">Sonra</p>
                    <p className="font-bold text-green-700">
                      {formatBytes(result.optimized.size)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">Ölçü</p>
                    <p className="font-bold text-gray-900">
                      {result.optimized.width} × {result.optimized.height}
                    </p>
                  </div>
                  <div className="rounded-xl bg-brand-50 p-3">
                    <p className="text-xs text-brand-600">Kazanım</p>
                    <p className="font-bold text-brand-700">
                      %{result.optimized.compressionRatio}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <p className="mb-1 text-xs font-semibold text-gray-500">URL</p>
                  <p className="break-all text-sm text-gray-800">{result.optimized.url}</p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Copy size={16} />
                    URL Kopyala
                  </button>
                  <a
                    href={result.optimized.url}
                    download={result.optimized.filename}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                  >
                    <Download size={16} />
                    İndir
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 text-sm text-brand-800">
            <div className="mb-2 flex items-center gap-2 font-bold">
              <RefreshCw size={16} />
              Öneri
            </div>
            <p>
              Ürün görsellerinde WebP + Ürün presetini, bannerlarda WebP veya AVIF +
              Banner presetini kullanın. PNG sadece şeffaflık şartsa tercih edilmeli.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
