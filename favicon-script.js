import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'src/assets/Logo.png');
const outputDir = path.join(__dirname, 'public');

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Process the image to create favicon
async function createFavicon() {
  try {
    // Create pure black version with transparency
    const blackOverlay = Buffer.from(
      '<svg><rect width="100%" height="100%" fill="black"/></svg>'
    );

    // For 32x32 favicon
    await sharp(inputPath)
      // Keep transparency but make visible parts pure black
      .ensureAlpha()
      .composite([
        {
          input: blackOverlay,
          blend: 'saturate'
        }
      ])
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon.png'));

    // For 192x192 favicon
    await sharp(inputPath)
      .ensureAlpha()
      .composite([
        {
          input: blackOverlay,
          blend: 'saturate'
        }
      ])
      .resize(192, 192)
      .png()
      .toFile(path.join(outputDir, 'favicon-192.png'));

    // For 512x512 favicon
    await sharp(inputPath)
      .ensureAlpha()
      .composite([
        {
          input: blackOverlay,
          blend: 'saturate'
        }
      ])
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'favicon-512.png'));
      
    console.log('Favicon created successfully!');
  } catch (error) {
    console.error('Error creating favicon:', error);
  }
}

createFavicon(); 