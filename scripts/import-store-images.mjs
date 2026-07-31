import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const desktop = "C:/Users/enesa/OneDrive/Masaüstü";
const output = "D:/fkkuruyemis/public/images/store-products";

const files = [
  "WhatsApp Im323age 2026-07-20 at 18.08.43.jpeg",
  "WhatsApp Image 2026-07-22320 at 18.09.09.jpeg",
  "WhatsApp Image 2026-07-2455450 at 18.09.52.jpeg",
  "WhatsApp Image 2026-07-20 a232t 18.08.54.jpeg",
  "WhatsApp Image 20454526-07-20 at 18.09.37.jpeg",
  "WhatsApp 545Image 2026-07-20 at 18.09.20.jpeg",
  "WhatsApp Image 2026-07-20 at456 18.10.38.jpeg",
  "WhatsApp Image 2026-07-20 at5656 18.10.31.jpeg",
  "WhatsApp I4545mage 2026-07-20 at 18.10.17.jpeg",
  "WhatsApp Image4564 2026-07-20 at 18.10.45.jpeg",
  "WhatsApp Imag456e 2026-07-20 at 18.10.49.jpeg",
  "WhatsApp Im6767age 2026-07-20 at 18.11.37.jpeg",
  "WhatsApp Image 2026-456407-20 at 18.10.45.jpeg",
  "WhatsApp Image 672026-07-20 at 18.11.21.jpeg",
  "WhatsA767pp Image 2026-07-20 at 18.12.24.jpeg",
  "WhatsApp Image 2076726-07-20 at 18.11.03.jpeg",
  "WhatsApp Ima7676ge 2026-07-20 at 18.13.03.jpeg",
  "WhatsApp Image 2026-07-2670 at 18.13.11.jpeg",
  "WhatsApp768 Image 2026-07-20 at 18.13.41.jpeg",
  "WhatsApp I6786mage 2026-07-20 at 18.13.46.jpeg",
  "WhatsApp Image 2026-0678-20 at 18.14.08.jpeg",
  "WhatsApp Image 7682026-07-20 at 18.13.54.jpeg",
  "WhatsApp I687mage 2026-07-20 at 18.14.30.jpeg",
  "WhatsApp Ima6786ge 2026-07-20 at 18.14.18.jpeg",
  "WhatsApp Image6786 2026-07-20 at 18.14.40.jpeg",
  "WhatsApp Image 202345346-07-20 at 18.15.08.jpeg",
  "WhatsAp565p Image 2026-07-20 at 18.15.27.jpeg",
  "WhatsApp Image6464 2026-07-20 at 18.15.49.jpeg",
  "WhatsApp Image 2026-07-20456 at 18.16.05.jpeg",
  "4456456.jpeg",
  "WhatsApp Image 2026-07456-20 at 18.15.56.jpeg",
  "Whats4564App Image 2026-07-20 at 18.17.01.jpeg",
  "WhatsApp Image 20246466-07-20 at 18.17.13.jpeg",
  "456546.jpeg",
  "WhatsApp Image 2026-07-20 a1t 18.06.51.jpeg",
  "Wha111tsApp Image 2026-07-20 at 18.07.19.jpeg",
  "WhatsApp Ima11ge 2026-07-20 at 18.06.58.jpeg",
  "WhatsAp1p Image 2026-07-20 at 18.07.12.jpeg",
  "WhatsApp I111mage 2026-07-20 at 18.07.33.jpeg",
  "WhatsApp Image 2026-07-20 at 18.07.111155.jpeg",
  "WhatsApp Image 202226-07-20 at 18.08.02.jpeg",
  "WhatsApp Image 2026-07-2220 at 18.08.10.jpeg",
  "WhatsApp Image 2026-07-20 111at 18.07.42.jpeg",
  "WhatsApp Image 2026-07-20 at 18333.08.23.jpeg",
  "WhatsApp Image22 2026-07-20 at 18.08.36.jpeg",
  "WhatsApp Image 2026-07-21110 at 18.06.46.jpeg",
  "WhatsApp Image 2026-07-20 at 18.04.54.jpeg",
  "WhatsApp Image1 2026-07-20 at 18.05.01.jpeg",
  "WhatsApp Image 2026-07-20 at 18.011.54.jpeg",
  "WhatsApp Image1 2026-07-20 at 18.05.22.jpeg",
  "Whats1App Image 2026-07-20 at 18.05.39.jpeg",
  "Wh1atsApp Image 2026-07-20 at 18.05.54.jpeg",
  "WhatsApp I1mage 2026-07-20 at 18.06.03.jpeg",
  "WhatsApp Image 201126-07-20 at 18.06.12.jpeg",
  "W112hatsApp Image 2026-07-20 at 18.06.22.jpeg",
  "WhatsApp Image 2026-07-2110 at 18.06.41.jpeg",
  "WhatsApp Image 2026-07-20 at 18.04.41.jpeg",
  "WhatsApp Image 2026-07-20 at 18.03.20.jpeg",
  "WhatsApp Image 2026-07-20 at 18.03.38.jpeg",
  "WhatsApp Image 2026-07-20 at 18.03.51.jpeg",
  "WhatsApp Image 2026-07-20 at 18.04.00.jpeg",
  "WhatsApp Image 2026-07-20 at 18.04.06.jpeg",
  "WhatsApp Image 2026-07-20 at 18.04.14.jpeg",
  "WhatsApp Image 2026-07-20 at 18.04.23.jpeg",
  "WhatsApp Image 2026-07-20 at 18.04.33.jpeg",
];

await mkdir(output, { recursive: true });

for (const [index, file] of files.entries()) {
  const id = String(index + 1).padStart(2, "0");
  await sharp(join(desktop, file))
    .rotate()
    .resize(1200, 1200, { fit: "cover", position: "attention" })
    .modulate({ brightness: 1.03, saturation: 1.04 })
    .sharpen({ sigma: 0.65 })
    .webp({ quality: 86, effort: 5 })
    .toFile(join(output, `store-${id}.webp`));
}

console.log(`${files.length} mağaza görseli optimize edildi.`);
