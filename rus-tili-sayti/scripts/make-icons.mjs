// Generates all app icons from scripts/icon.svg: node scripts/make-icons.mjs
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("..", import.meta.url);
const svg = readFileSync(new URL("scripts/icon.svg", root));
const out = (p) => new URL(p, root);

const png = (size) => sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();

writeFileSync(out("public/icon-192.png"), await png(192));
writeFileSync(out("public/icon-512.png"), await png(512));

// Maskable: full-bleed background, artwork inside the 80% safe zone.
const inner = await png(400);
const maskable = await sharp({
  create: { width: 512, height: 512, channels: 4, background: "#22c07a" },
})
  .composite([{ input: inner, left: 56, top: 56 }])
  .png()
  .toBuffer();
writeFileSync(out("public/icon-maskable-512.png"), maskable);

// Apple icons get no transparency, so put the circle on white.
const apple = await sharp({
  create: { width: 180, height: 180, channels: 4, background: "#ffffff" },
})
  .composite([{ input: await png(164), left: 8, top: 8 }])
  .png()
  .toBuffer();
writeFileSync(out("src/app/apple-icon.png"), apple);

// favicon.ico with PNG-encoded entries.
const sizes = [16, 32, 48, 64, 256];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s >= 256 ? 0 : s, e);
  header.writeUInt8(s >= 256 ? 0 : s, e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(images[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += images[i].length;
});
writeFileSync(out("src/app/favicon.ico"), Buffer.concat([header, ...images]));

console.log("Icons written.");
