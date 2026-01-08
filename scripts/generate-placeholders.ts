/**
 * Placeholder Image Generator for Gozlem
 * Creates gradient-based placeholder images for each category
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const IMAGES_PER_CATEGORY = 25;
const OUTPUT_DIR = './web/public/images/prompts';
const IMAGE_SIZE = 512;

// Category color themes (dark, moody gradients)
const CATEGORY_THEMES: Record<string, { colors: string[][]; symbol: string }> = {
  time: {
    colors: [
      ['#1a1a2e', '#16213e', '#0f3460'],
      ['#0d0d0d', '#1a1a2e', '#2d2d44'],
      ['#141e30', '#243b55', '#141e30'],
      ['#0f0c29', '#302b63', '#24243e'],
      ['#1f1c2c', '#928dab', '#1f1c2c'],
    ],
    symbol: '◷'
  },
  curiosity: {
    colors: [
      ['#0f0f23', '#1a1a3e', '#2a2a5e'],
      ['#0d1117', '#161b22', '#21262d'],
      ['#1a1a2e', '#2d2d5a', '#1a1a2e'],
      ['#0a0a1a', '#1a1a3a', '#2a2a5a'],
      ['#12121f', '#1e1e3f', '#2a2a5f'],
    ],
    symbol: '?'
  },
  control: {
    colors: [
      ['#1a1a1a', '#2d2d2d', '#404040'],
      ['#0d0d0d', '#1a1a1a', '#262626'],
      ['#141414', '#282828', '#3c3c3c'],
      ['#0f0f0f', '#1f1f1f', '#2f2f2f'],
      ['#1c1c1c', '#2c2c2c', '#3c3c3c'],
    ],
    symbol: '◈'
  },
  risk: {
    colors: [
      ['#1a0a0a', '#2d1515', '#401a1a'],
      ['#0d0505', '#1a0a0a', '#260f0f'],
      ['#140a0a', '#281414', '#3c1e1e'],
      ['#1a0f0f', '#2d1a1a', '#402525'],
      ['#0f0808', '#1f1010', '#2f1818'],
    ],
    symbol: '⚠'
  },
  sacrifice: {
    colors: [
      ['#1a1a0a', '#2d2d15', '#40401a'],
      ['#0d0d05', '#1a1a0a', '#26260f'],
      ['#14140a', '#282814', '#3c3c1e'],
      ['#1a1a0f', '#2d2d1a', '#404025'],
      ['#0f0f08', '#1f1f10', '#2f2f18'],
    ],
    symbol: '✦'
  },
  pattern: {
    colors: [
      ['#0a1a1a', '#152d2d', '#1a4040'],
      ['#050d0d', '#0a1a1a', '#0f2626'],
      ['#0a1414', '#142828', '#1e3c3c'],
      ['#0f1a1a', '#1a2d2d', '#254040'],
      ['#080f0f', '#101f1f', '#182f2f'],
    ],
    symbol: '◇'
  },
  memory: {
    colors: [
      ['#1a0a1a', '#2d152d', '#401a40'],
      ['#0d050d', '#1a0a1a', '#260f26'],
      ['#140a14', '#281428', '#3c1e3c'],
      ['#1a0f1a', '#2d1a2d', '#402540'],
      ['#0f080f', '#1f101f', '#2f182f'],
    ],
    symbol: '◐'
  }
};

async function createGradientImage(
  colors: string[],
  symbol: string,
  index: number
): Promise<Buffer> {
  // Create SVG with gradient
  const gradientId = `grad${index}`;
  const rotation = (index * 15) % 360;

  const svg = `
    <svg width="${IMAGE_SIZE}" height="${IMAGE_SIZE}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${rotation})">
          <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${colors[1]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors[2]};stop-opacity:1" />
        </linearGradient>
        <radialGradient id="vignette">
          <stop offset="0%" style="stop-color:transparent;stop-opacity:0" />
          <stop offset="70%" style="stop-color:black;stop-opacity:0" />
          <stop offset="100%" style="stop-color:black;stop-opacity:0.7" />
        </radialGradient>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.${6 + (index % 4)}" numOctaves="3" result="noise"/>
          <feColorMatrix type="saturate" values="0"/>
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" result="blend"/>
          <feBlend in="blend" in2="SourceGraphic" mode="screen"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#${gradientId})"/>
      <rect width="100%" height="100%" fill="url(#vignette)"/>
      <text
        x="50%"
        y="50%"
        font-size="${80 + (index % 3) * 20}"
        fill="rgba(255,255,255,0.08)"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Arial"
      >${symbol}</text>
    </svg>
  `;

  return Buffer.from(svg);
}

async function main() {
  console.log('🎨 Gozlem Placeholder Generator');
  console.log('================================\n');

  // Ensure output directories exist
  for (const category of Object.keys(CATEGORY_THEMES)) {
    const dir = path.join(OUTPUT_DIR, category);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  let totalGenerated = 0;

  for (const [category, theme] of Object.entries(CATEGORY_THEMES)) {
    console.log(`\n📁 Category: ${category.toUpperCase()}`);

    for (let i = 0; i < IMAGES_PER_CATEGORY; i++) {
      const colorSet = theme.colors[i % theme.colors.length];
      const filename = `${category}_${String(i + 1).padStart(3, '0')}.png`;
      const filepath = path.join(OUTPUT_DIR, category, filename);

      try {
        const svgBuffer = await createGradientImage(colorSet, theme.symbol, i);

        await sharp(svgBuffer)
          .resize(IMAGE_SIZE, IMAGE_SIZE)
          .png({ quality: 90 })
          .toFile(filepath);

        console.log(`   ✅ ${filename}`);
        totalGenerated++;
      } catch (error) {
        console.error(`   ❌ ${filename}: ${error}`);
      }
    }
  }

  console.log('\n================================');
  console.log(`✅ Generated: ${totalGenerated} images`);
  console.log(`📁 Location: ${OUTPUT_DIR}`);
}

main().catch(console.error);
