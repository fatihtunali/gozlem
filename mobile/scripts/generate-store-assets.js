const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const assetsDir = path.join(__dirname, '..', 'assets');
const outputDir = path.join(__dirname, '..', 'store-assets');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateStoreAssets() {
  const iconPath = path.join(assetsDir, 'icon.png');

  // 1. Generate 512x512 app icon for Play Store
  console.log('Generating 512x512 app icon...');
  await sharp(iconPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'app-icon-512.png'));
  console.log('✓ App icon saved to store-assets/app-icon-512.png');

  // 2. Generate feature graphic (1024x500)
  console.log('Generating feature graphic (1024x500)...');

  // Create a dark background with gradient effect
  const width = 1024;
  const height = 500;

  // Create SVG for background with text
  const svgBackground = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a0a2e;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#16082a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f0f0f;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <text x="${width/2}" y="${height - 80}"
            font-family="Arial, sans-serif"
            font-size="48"
            font-weight="bold"
            fill="#ffffff"
            text-anchor="middle">
        Haydi Hep Beraber
      </text>
      <text x="${width/2}" y="${height - 30}"
            font-family="Arial, sans-serif"
            font-size="24"
            fill="#a855f7"
            text-anchor="middle">
        Anonim itiraf paylaş, destek ol
      </text>
    </svg>
  `;

  // Create background
  const background = await sharp(Buffer.from(svgBackground))
    .png()
    .toBuffer();

  // Resize icon for feature graphic (250x250)
  const iconForFeature = await sharp(iconPath)
    .resize(250, 250)
    .png()
    .toBuffer();

  // Composite icon onto background
  await sharp(background)
    .composite([{
      input: iconForFeature,
      top: 60,
      left: Math.floor((width - 250) / 2)
    }])
    .png()
    .toFile(path.join(outputDir, 'feature-graphic-1024x500.png'));

  console.log('✓ Feature graphic saved to store-assets/feature-graphic-1024x500.png');

  console.log('\nAll store assets generated successfully!');
  console.log('Files are in:', outputDir);
}

generateStoreAssets().catch(console.error);
