import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Standalone SVG Icon with dark circular container and vibrant Netronomic Orb
const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0c1938" />
      <stop offset="85%" stop-color="#050b18" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>
    <linearGradient id="orbGradCore" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
    <linearGradient id="ringGradGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
    <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Circular Base with border -->
  <circle cx="60" cy="60" r="56" fill="url(#bgGrad)" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.6" />
  <circle cx="60" cy="60" r="50" fill="none" stroke="#0284c7" stroke-width="0.8" stroke-dasharray="6 4" opacity="0.4" />

  <!-- Netronomic Vector Orb Scaled & Centered (original 100x100 scaled into 80x80 inside 120x120) -->
  <g transform="translate(20, 20) scale(0.8)">
    <ellipse cx="50" cy="50" rx="43" ry="17" transform="rotate(-30 50 50)" stroke="url(#ringGradGlow)" stroke-width="2.5" stroke-dasharray="50 110" opacity="0.6" />
    <g>
      <circle cx="50" cy="50" r="28" stroke="url(#orbGradCore)" stroke-width="2" fill="none" opacity="0.4" />
      <ellipse cx="50" cy="50" rx="28" ry="12" stroke="#0284c7" stroke-width="1.4" fill="none" opacity="0.8" />
      <ellipse cx="50" cy="50" rx="12" ry="28" stroke="#0284c7" stroke-width="1.4" fill="none" opacity="0.8" />
      <line x1="30" y1="34" x2="70" y2="66" stroke="#38bdf8" stroke-width="1.5" />
      <line x1="70" y1="34" x2="30" y2="66" stroke="#38bdf8" stroke-width="1.5" />
      <line x1="50" y1="22" x2="50" y2="78" stroke="#0284c7" stroke-width="1.4" />
      <line x1="22" y1="50" x2="78" y2="50" stroke="#0284c7" stroke-width="1.4" />
    </g>
    <ellipse cx="50" cy="50" rx="45" ry="18" transform="rotate(-30 50 50)" stroke="url(#ringGradGlow)" stroke-width="3" fill="none" />
    <g fill="#38bdf8">
      <circle cx="50" cy="22" r="3.2" fill="#0284c7" />
      <circle cx="50" cy="78" r="3.2" fill="#0284c7" />
      <circle cx="22" cy="50" r="3.2" fill="#0284c7" />
      <circle cx="78" cy="50" r="3.2" fill="#0284c7" />
      <circle cx="30" cy="34" r="3.6" fill="#38bdf8" />
      <circle cx="70" cy="34" r="3.6" fill="#38bdf8" />
      <circle cx="30" cy="66" r="3.6" fill="#38bdf8" />
      <circle cx="70" cy="66" r="3.6" fill="#38bdf8" />
      <circle cx="50" cy="50" r="4.8" fill="#ffffff" stroke="#0284c7" stroke-width="1.6" filter="url(#cyanGlow)" />
    </g>
  </g>
</svg>`;

// 2. OpenGraph / Social Share Card (1200x630)
const svgOgBanner = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <radialGradient id="ogBg" cx="50%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="60%" stop-color="#050b18" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#93c5fd" />
    </linearGradient>
    <linearGradient id="orbGradCore" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
    <linearGradient id="ringGradGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#ogBg)" />

  <!-- Background decorative glowing grid and circles -->
  <circle cx="600" cy="220" r="280" fill="#0284c7" opacity="0.08" filter="blur(60px)" />
  <circle cx="200" cy="500" r="200" fill="#38bdf8" opacity="0.05" filter="blur(40px)" />

  <!-- Logo Orb (Centered top) -->
  <g transform="translate(530, 90) scale(1.4)">
    <ellipse cx="50" cy="50" rx="43" ry="17" transform="rotate(-30 50 50)" stroke="url(#ringGradGlow)" stroke-width="2.5" stroke-dasharray="50 110" opacity="0.6" />
    <g>
      <circle cx="50" cy="50" r="28" stroke="url(#orbGradCore)" stroke-width="2" fill="none" opacity="0.4" />
      <ellipse cx="50" cy="50" rx="28" ry="12" stroke="#0284c7" stroke-width="1.4" fill="none" opacity="0.8" />
      <ellipse cx="50" cy="50" rx="12" ry="28" stroke="#0284c7" stroke-width="1.4" fill="none" opacity="0.8" />
      <line x1="30" y1="34" x2="70" y2="66" stroke="#38bdf8" stroke-width="1.5" />
      <line x1="70" y1="34" x2="30" y2="66" stroke="#38bdf8" stroke-width="1.5" />
      <line x1="50" y1="22" x2="50" y2="78" stroke="#0284c7" stroke-width="1.4" />
      <line x1="22" y1="50" x2="78" y2="50" stroke="#0284c7" stroke-width="1.4" />
    </g>
    <ellipse cx="50" cy="50" rx="45" ry="18" transform="rotate(-30 50 50)" stroke="url(#ringGradGlow)" stroke-width="3" fill="none" />
    <g fill="#38bdf8">
      <circle cx="50" cy="22" r="3.2" fill="#0284c7" />
      <circle cx="50" cy="78" r="3.2" fill="#0284c7" />
      <circle cx="22" cy="50" r="3.2" fill="#0284c7" />
      <circle cx="78" cy="50" r="3.2" fill="#0284c7" />
      <circle cx="30" cy="34" r="3.6" fill="#38bdf8" />
      <circle cx="70" cy="34" r="3.6" fill="#38bdf8" />
      <circle cx="30" cy="66" r="3.6" fill="#38bdf8" />
      <circle cx="70" cy="66" r="3.6" fill="#38bdf8" />
      <circle cx="50" cy="50" r="5.2" fill="#ffffff" stroke="#0284c7" stroke-width="1.6" />
    </g>
  </g>

  <!-- Typography -->
  <text x="600" y="300" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="url(#textGrad)" letter-spacing="4">NETRONOMIC WEB</text>
  
  <text x="600" y="345" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#38bdf8" letter-spacing="6">FULL-SERVICE DIGITAL AGENCY</text>

  <text x="600" y="410" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94a3b8">Web Development • Logo Design • Video Reels • SEO &amp; Backlinks</text>

  <!-- Badge at bottom -->
  <rect x="460" y="480" width="280" height="48" rx="24" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="1.5" />
  <text x="600" y="511" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#38bdf8" letter-spacing="1">WWW.NETRONOMIC.COM</text>
</svg>`;

async function main() {
  const svgBuffer = Buffer.from(svgFavicon);
  const ogBuffer = Buffer.from(svgOgBanner);

  // Write SVG favicon
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgFavicon, 'utf8');
  console.log('Created favicon.svg');

  // Generate PNG sizes
  const sizes = [
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'netronomic-logo.png', size: 512 },
    { name: 'favicon-512x512.png', size: 512 },
  ];

  for (const item of sizes) {
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(path.join(publicDir, item.name));
    console.log(`Created ${item.name} (${item.size}x${item.size})`);
  }

  // Generate favicon.ico (using 48x48 or 32x32 png)
  await sharp(svgBuffer)
    .resize(48, 48)
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Created favicon.ico');

  // Generate OpenGraph Image
  await sharp(ogBuffer)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('Created og-image.png (1200x630)');
}

main().catch(console.error);
