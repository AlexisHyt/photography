import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

// Single source of truth for the sun mark. Every icon in the repo — the favicon,
// the Apple touch icon and the PWA icon set — is rendered from the shapes below,
// so a colour or proportion change here propagates everywhere.
const PLATE = "#161320";
const RAYS = "#FF8A3C";
const DISC = "#FFC24B";

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function sun({
  plateRadius = 14,
  rayWidth = 6,
  rayTop = 4.5,
  rayLength = 11,
  discRadius = 12,
  scale = 1,
}) {
  const rays = RAY_ANGLES.map((angle) => {
    const rotation = angle ? ` transform="rotate(${angle} 32 32)"` : "";
    return `<rect x="${32 - rayWidth / 2}" y="${rayTop}" width="${rayWidth}" height="${rayLength}" rx="${rayWidth / 2}"${rotation}/>`;
  }).join("");

  const mark =
    `<g fill="${RAYS}">${rays}</g>` +
    `<circle cx="32" cy="32" r="${discRadius}" fill="${DISC}"/>`;

  // Maskable icons are cropped by the platform, so the mark is scaled down
  // around the centre to stay inside the safe zone.
  const scaled =
    scale === 1
      ? mark
      : `<g transform="translate(32 32) scale(${scale}) translate(-32 -32)">${mark}</g>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Sun">` +
    `<rect width="64" height="64" rx="${plateRadius}" fill="${PLATE}"/>` +
    `${scaled}</svg>`
  );
}

const REFINED = sun({});
// Chunkier proportions so the rays survive at 16px.
const BOLD = sun({ rayWidth: 7.5, rayTop: 4, rayLength: 9.5, discRadius: 13.5 });
// Full-bleed plate: iOS and Android apply their own corner mask.
const FULL_BLEED = sun({ plateRadius: 0 });
const MASKABLE = sun({ plateRadius: 0, scale: 0.66 });

function png(source, size) {
  return sharp(Buffer.from(source), { density: 512 })
    .resize(size, size)
    .png()
    .toBuffer();
}

// PNG-encoded .ico, readable by every browser that still asks for /favicon.ico.
function ico(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // image type: icon
  header.writeUInt16LE(entries.length, 4);

  let offset = header.length + entries.length * 16;
  const directory = entries.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...directory, ...entries.map((e) => e.data)]);
}

mkdirSync("public/icons", { recursive: true });

writeFileSync("public/icon.svg", `${REFINED}\n`);

writeFileSync(
  "public/favicon.ico",
  ico([
    { size: 16, data: await png(BOLD, 16) },
    { size: 32, data: await png(REFINED, 32) },
    { size: 48, data: await png(REFINED, 48) },
  ]),
);

const rasters = [
  ["public/apple-icon.png", FULL_BLEED, 180],
  ["public/icons/icon-192.png", REFINED, 192],
  ["public/icons/icon-512.png", REFINED, 512],
  ["public/icons/icon-maskable-192.png", MASKABLE, 192],
  ["public/icons/icon-maskable-512.png", MASKABLE, 512],
];

for (const [file, source, size] of rasters) {
  writeFileSync(file, await png(source, size));
}

console.log(
  ["public/icon.svg", "public/favicon.ico", ...rasters.map(([file]) => file)].join(
    "\n",
  ),
);
