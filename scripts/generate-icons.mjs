import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.resolve(__dirname, '../assets');

const STRAWBERRY_SVG_URL =
  'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Strawberry/Flat/strawberry_flat.svg';

const BACKGROUND = { r: 0xff, g: 0xe4, b: 0xe6, alpha: 1 };
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
const ICON_SIZE = 1024;
const BERRY_RATIO = 0.62;
const SPLASH_BERRY_RATIO = 0.72;
const RENDER_DENSITY = 2880;

async function fetchSvg() {
  const res = await fetch(STRAWBERRY_SVG_URL);
  if (!res.ok) throw new Error(`Failed to fetch strawberry SVG: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function renderBerry(svg, size) {
  return sharp(svg, { density: RENDER_DENSITY })
    .resize(size, size, { fit: 'contain', background: TRANSPARENT })
    .png()
    .toBuffer();
}

async function squareWithBerry({ berry, size, background }) {
  return sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: berry, gravity: 'center' }])
    .png()
    .toBuffer();
}

async function monochrome(berryOnSquare) {
  const size = ICON_SIZE;
  const black = sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  });
  return black
    .composite([{ input: berryOnSquare, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function main() {
  const svg = await fetchSvg();

  const iconBerry = await renderBerry(svg, Math.round(ICON_SIZE * BERRY_RATIO));
  const splashBerry = await renderBerry(svg, Math.round(ICON_SIZE * SPLASH_BERRY_RATIO));
  const faviconBerry = await renderBerry(svg, Math.round(48 * BERRY_RATIO));

  const foreground = await squareWithBerry({ berry: iconBerry, size: ICON_SIZE, background: TRANSPARENT });

  const outputs = {
    'icon.png': await squareWithBerry({ berry: iconBerry, size: ICON_SIZE, background: BACKGROUND }),
    'android-icon-foreground.png': foreground,
    'android-icon-monochrome.png': await monochrome(foreground),
    'splash-icon.png': await squareWithBerry({ berry: splashBerry, size: ICON_SIZE, background: TRANSPARENT }),
    'favicon.png': await squareWithBerry({ berry: faviconBerry, size: 48, background: BACKGROUND }),
  };

  for (const [name, buffer] of Object.entries(outputs)) {
    const filePath = path.join(ASSETS_DIR, name);
    await writeFile(filePath, buffer);
    console.log(`generated ${name} (${buffer.length} bytes)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
