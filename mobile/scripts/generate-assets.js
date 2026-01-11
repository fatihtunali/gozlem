const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

// Ana renk
const PRIMARY_COLOR = '#d946ef';
const BG_COLOR = '#0f0f0f';

// SVG Logo - Kalp icinde el
const logoSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#d946ef;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a21caf;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="${BG_COLOR}"/>
  <circle cx="512" cy="512" r="400" fill="url(#grad)" opacity="0.15"/>
  <circle cx="512" cy="512" r="300" fill="url(#grad)" opacity="0.25"/>
  <!-- Kalp -->
  <path d="M512 800 C300 600 200 450 200 350 C200 250 280 180 380 180 C450 180 500 220 512 260 C524 220 574 180 644 180 C744 180 824 250 824 350 C824 450 724 600 512 800Z"
        fill="url(#grad)" />
  <!-- El ikonu -->
  <path d="M480 380 L480 520 L430 520 L430 420 C430 400 445 385 465 385 L480 380Z
           M520 350 L520 520 L480 520 L480 350 C480 330 495 315 515 315 L520 350Z
           M560 370 L560 520 L520 520 L520 370 C520 350 535 335 555 335 L560 370Z
           M600 400 L600 520 L560 520 L560 400 C560 380 575 365 595 365 L600 400Z
           M430 520 L600 520 L600 580 C600 620 570 650 530 650 L500 650 C460 650 430 620 430 580 L430 520Z"
        fill="white" opacity="0.95"/>
</svg>
`;

// Adaptive icon foreground (sadece logo, seffaf arka plan)
const adaptiveIconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#d946ef;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a21caf;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Kalp -->
  <path d="M512 800 C300 600 200 450 200 350 C200 250 280 180 380 180 C450 180 500 220 512 260 C524 220 574 180 644 180 C744 180 824 250 824 350 C824 450 724 600 512 800Z"
        fill="url(#grad)" />
  <!-- El ikonu -->
  <path d="M480 380 L480 520 L430 520 L430 420 C430 400 445 385 465 385 L480 380Z
           M520 350 L520 520 L480 520 L480 350 C480 330 495 315 515 315 L520 350Z
           M560 370 L560 520 L520 520 L520 370 C520 350 535 335 555 335 L560 370Z
           M600 400 L600 520 L560 520 L560 400 C560 380 575 365 595 365 L600 400Z
           M430 520 L600 520 L600 580 C600 620 570 650 530 650 L500 650 C460 650 430 620 430 580 L430 520Z"
        fill="white" opacity="0.95"/>
</svg>
`;

// Splash screen
const splashSvg = `
<svg width="1284" height="2778" viewBox="0 0 1284 2778" xmlns="http://www.w3.org/2000/svg">
  <rect width="1284" height="2778" fill="${BG_COLOR}"/>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#d946ef;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a21caf;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Arka plan daireleri -->
  <circle cx="642" cy="1200" r="500" fill="url(#grad)" opacity="0.08"/>
  <circle cx="642" cy="1200" r="350" fill="url(#grad)" opacity="0.12"/>
  <!-- Kalp -->
  <path transform="translate(392, 950)" d="M250 425 C150 300 100 225 100 175 C100 125 140 90 190 90 C225 90 250 110 256 130 C262 110 287 90 322 90 C372 90 412 125 412 175 C412 225 362 300 250 425Z"
        fill="url(#grad)" />
  <!-- El ikonu -->
  <path transform="translate(392, 950)" d="M234 190 L234 260 L209 260 L209 210 C209 200 217 193 227 193 L234 190Z
           M254 175 L254 260 L234 260 L234 175 C234 165 242 158 252 158 L254 175Z
           M274 185 L274 260 L254 260 L254 185 C254 175 262 168 272 168 L274 185Z
           M294 200 L294 260 L274 260 L274 200 C274 190 282 183 292 183 L294 200Z
           M209 260 L294 260 L294 290 C294 310 279 325 259 325 L244 325 C224 325 209 310 209 290 L209 260Z"
        fill="white" opacity="0.95"/>
  <!-- Yazi -->
  <text x="642" y="1550" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">Haydi Hep Beraber</text>
  <text x="642" y="1620" font-family="Arial, sans-serif" font-size="32" fill="#888888" text-anchor="middle">İtiraflarını paylaş</text>
</svg>
`;

async function generateAssets() {
  console.log('Asset\'ler olusturuluyor...');

  // Icon (1024x1024)
  await sharp(Buffer.from(logoSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('✓ icon.png');

  // Adaptive icon foreground
  await sharp(Buffer.from(adaptiveIconSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'adaptive-icon.png'));
  console.log('✓ adaptive-icon.png');

  // Splash icon
  await sharp(Buffer.from(logoSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));
  console.log('✓ splash-icon.png');

  // Favicon
  await sharp(Buffer.from(logoSvg))
    .resize(48, 48)
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
  console.log('✓ favicon.png');

  console.log('\nTum asset\'ler olusturuldu!');
}

generateAssets().catch(console.error);
