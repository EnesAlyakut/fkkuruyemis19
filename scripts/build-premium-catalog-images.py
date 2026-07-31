from __future__ import annotations

import hashlib
import re
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "src" / "data" / "storeCatalog.ts"
SOURCE_DIR = ROOT / "public" / "images" / "store-products"
OUTPUT_DIR = ROOT / "public" / "images" / "catalog-premium"
GENERATED_DIR = Path(r"C:\Users\enesa\.codex\generated_images\019f8693-ec42-7df0-9da2-d16bfb08165c")

MASTERS = {
    "classic": "exec-364c956a-bfc0-4ed1-84d9-0474bbe1e7f2.png",
    "uzumlu": "exec-01e76bc0-9d9a-42ec-989d-2454c6b1e71b.png",
    "cips": "exec-14d732df-5dd7-497d-8598-7204bfb23778.png",
    "ates": "exec-6dd7bc7c-0973-4e21-a8f0-21e112f956f9.png",
    "corum-karisik": "exec-de9cc24a-c8bf-4ba4-a6fa-7af22ed13132.png",
    "tandir": "exec-47a96f17-e3e0-4087-9b71-a6c56480c13c.png",
    "renkli": "exec-e11ec9cd-b34c-4068-a24d-2e426c8d649f.png",
    "premium-karisik": "exec-8d6bd491-0ba9-4808-abd9-2108c3682ea6.png",
    "kaju": "exec-1934d040-4861-4c5e-9150-3364145512f5.png",
    "findik": "exec-472d0581-2b7e-499d-b93c-8385a4a7b4c7.png",
    "badem": "exec-36e1d6b6-0924-419c-a060-1c1f8d3aaabe.png",
    "aycekirdegi": "exec-505f5a89-aa2e-415b-8c40-216c6bdd9517.png",
    "kabakcekirdegi": "exec-1c9ff22e-f901-4795-a9ce-edab46f34529.png",
    "ceviz": "exec-bda4ddce-6c89-4ce1-a79d-7f7d69ed879f.png",
    "hurma": "exec-bb31914e-666b-4259-8af0-a8ee5157a658.png",
    "kayisi": "exec-f74e3ac8-c332-43ce-a4e6-3ca9b51b4a9f.png",
    "draje": "exec-662139c2-36b2-4ba5-9fc8-7acf366f9e5d.png",
    "kaymak": "exec-970d58fc-51b3-4a0a-ba14-6be0339d37a6.png",
    "atistirmalik": "exec-81b37c13-7c02-4b70-8230-096a33b55c82.png",
    "sade-krema": "exec-5dcac219-9d76-43c9-9fab-99ba815db02e.png",
    "kakao-krema": "exec-79dd109d-34eb-44bf-964f-d4f137b75679.png",
    "kahve": "exec-c3975ff1-1982-464f-acfc-d8ba04836110.png",
    "tozlar": "exec-195011d8-4cc3-4fc9-8b7f-2074082a9c41.png",
    "kolonya": "exec-8c8851cf-d647-4406-a5fb-7f13e4d5a97a.png",
    "cikolatali-hurma": "exec-853d6c5e-64c2-4be4-8d54-bb3440889272.png",
    "blueberry": "exec-901cb71b-9202-4a39-8bcf-178e8ce4f6af.png",
    "hunnap": "exec-9382846b-f686-4ac5-8590-26f94108b8e4.png",
    "yer-kirazi": "exec-766c5bb1-c437-44a4-88c8-4f7e025659aa.png",
    "mispet": "exec-f6cfdba4-1cac-4616-bc26-383263d2797f.png",
}

# Ürünü gerçekte olduğundan farklı göstermemek için yalnızca aynı ürün ailesindeki
# stüdyo görselleri paylaşılır. Ambalajı önemli olan ürünler özgün fotoğraftan işlenir.
MASTER_FOR = {
    "uzumlu-karisik": "uzumlu", "cips-fistik": "cips", "corum-atesi": "ates",
    "corum-karisik": "corum-karisik", "tandir-tuzlu-leblebi": "tandir",
    "renkli-sekerli-leblebi": "renkli", "tuzlu-ay-cekirdegi": "aycekirdegi",
    "tuzsuz-ay-cekirdegi": "aycekirdegi", "ceviz-ici": "ceviz",
    "sade-leblebi-kremasi": "sade-krema", "kakaolu-leblebi-kremasi": "kakao-krema",
    "citir-karisik": "premium-karisik", "siirt-fistigi": "premium-karisik",
    "kudus-hurma": "hurma", "cig-findik": "findik", "kudus-l-hurma": "hurma",
    "blueberry-kurusu": "blueberry", "hunnap-kurusu": "hunnap", "yer-kirazi-kurusu": "yer-kirazi",
    "jumbo-kayisi": "kayisi", "taze-kahve": "kahve", "igde-tozu": "tozlar",
    "leblebi-tozu": "tozlar", "hashas": "tozlar", "tuzsuz-fistik": "premium-karisik",
    "cig-kabak-cekirdegi": "kabakcekirdegi", "tuzlu-kabak-cekirdegi": "kabakcekirdegi",
    "tuzlu-fistik": "premium-karisik", "tuzsuz-kabak-cekirdegi": "kabakcekirdegi",
    "kavrulmus-badem": "badem", "premium-cig-findik": "findik",
    "luks-karisik": "premium-karisik", "premium-karisik": "premium-karisik",
    "luks-kaju": "kaju", "yasam-cerezi": "uzumlu", "osmanli-karisik": "corum-karisik",
    "tuzlu-fistik-premium": "premium-karisik", "cilek-kaymak": "kaymak",
    "bogurtlen-kaymak": "kaymak", "narli-kaymakli": "kaymak",
    "renkli-meyveli-draje": "draje", "citir-leblebi-draje": "draje",
    "benekli-cikolata-draje": "draje", "benekli-badem-draje": "draje",
    "tuzlu-fistik-ozel": "premium-karisik", "trilece-kaymak": "kaymak",
    "kraker-cikolata": "draje", "mix-cikolata": "draje", "sutlu-cikolata": "draje",
    "fildisi-cikolata": "draje", "cikolatali-hurma-sekeri": "cikolatali-hurma",
    "kahve-mix": "draje", "kaymakli-leblebi-karisik": "renkli", "mispet": "mispet",
    "saqra-kolonya-cesitleri": "kolonya",
    "baharatli-leblebi": "ates", "klasik-leblebi": "classic",
    "peynirli-leblebi": "tandir", "acili-leblebi": "ates",
    "nane-limon-leblebi": "tandir", "visne-leblebi": "renkli",
    "super-leblebi": "classic", "super-ekstra-leblebi": "classic",
    "ozel-ekstra-leblebi": "classic", "cevrek-leblebi": "classic",
    "kirik-leblebi": "classic", "mesir-macunlu-leblebi": "ates",
    "sakiz-leblebi": "renkli", "luks-balli-leblebi": "ates",
}


def catalog_products() -> list[tuple[str, int]]:
    text = CATALOG.read_text(encoding="utf-8")
    return [(slug, int(image_no)) for slug, image_no in re.findall(
        r'product\("([^"]+)"\s*,\s*"[^"]+"\s*,\s*[\d.]+\s*,\s*"[^"]+"\s*,\s*(\d+)',
        text,
    )]


def deterministic_adjustment(slug: str) -> tuple[float, float, float]:
    digest = hashlib.sha256(slug.encode()).digest()
    zoom = 1.015 + (digest[0] / 255) * 0.04
    dx = (digest[1] / 255 - 0.5) * 0.035
    dy = (digest[2] / 255 - 0.5) * 0.035
    return zoom, dx, dy


def square_crop(image: Image.Image, zoom: float, dx: float, dy: float) -> Image.Image:
    w, h = image.size
    side = min(w, h) / zoom
    cx = w / 2 + dx * w
    cy = h / 2 + dy * h
    left = max(0, min(w - side, cx - side / 2))
    top = max(0, min(h - side, cy - side / 2))
    return image.crop((round(left), round(top), round(left + side), round(top + side)))


def source_product_crop(image: Image.Image, slug: str) -> Image.Image:
    w, h = image.size
    # Dikey mağaza fotoğraflarında ürün çoğunlukla orta-üst bölgede, fiyat kartı alttadır.
    if h > w:
        side = w * 0.92
        focus_y = 0.35 if slug in {"sultani-kahvesi", "blueberry-kurusu"} else 0.27
        cx, cy = w / 2, h * focus_y
        left = max(0, min(w - side, cx - side / 2))
        top = max(0, min(h - side, cy - side / 2))
        image = image.crop((round(left), round(top), round(left + side), round(top + side)))
    else:
        side = min(h * 0.94, w)
        left = (w - side) / 2
        top = max(0, (h - side) * 0.32)
        image = image.crop((round(left), round(top), round(left + side), round(top + side)))
    image = ImageEnhance.Brightness(image).enhance(1.04)
    image = ImageEnhance.Contrast(image).enhance(1.09)
    image = ImageEnhance.Color(image).enhance(1.08)
    image = ImageEnhance.Sharpness(image).enhance(1.22)
    return image


def finish(image: Image.Image) -> Image.Image:
    image = ImageOps.exif_transpose(image).convert("RGB")
    image = image.resize((960, 960), Image.Resampling.LANCZOS)
    # Hafif keskinlik, doğal ürün dokusunu belirginleştirir; yapay detay eklemez.
    return image.filter(ImageFilter.UnsharpMask(radius=1.1, percent=70, threshold=3))


def main() -> None:
    products = catalog_products()
    if len(products) != 74:
        raise RuntimeError(f"74 ürün bekleniyordu, {len(products)} bulundu")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for slug, image_no in products:
        master_key = MASTER_FOR.get(slug)
        if master_key:
            source = GENERATED_DIR / MASTERS[master_key]
            image = Image.open(source).convert("RGB")
            zoom, dx, dy = deterministic_adjustment(slug)
            image = square_crop(image, zoom, dx, dy)
        else:
            source = SOURCE_DIR / f"store-{image_no:02d}.webp"
            image = source_product_crop(Image.open(source).convert("RGB"), slug)

        output = OUTPUT_DIR / f"{slug}.webp"
        finish(image).save(output, "WEBP", quality=88, method=6)

    print(f"{len(products)} premium katalog görseli oluşturuldu: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
