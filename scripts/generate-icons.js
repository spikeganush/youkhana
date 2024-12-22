const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const SOURCE_LOGO = path.join(__dirname, '../public/images/logo.png');
const OUTPUT_DIR = path.join(__dirname, '../public');

async function generateIcons() {
  const sizes = {
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
    'apple-touch-icon.png': 180,
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32
  };

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Generate PNG icons
  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(SOURCE_LOGO)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, filename));
    
    console.log(`Generated ${filename}`);
  }

  // For favicon.ico, we'll just copy the 32x32 PNG as favicon.png
  await sharp(SOURCE_LOGO)
    .resize(32, 32)
    .png()
    .toFile(path.join(OUTPUT_DIR, 'favicon.png'));
  
  console.log('Generated favicon.png (use this instead of favicon.ico)');
}

generateIcons().catch(console.error);
