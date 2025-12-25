const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// List of images to optimize
const images = [
  'bandicam 2025-11-05 11-20-58-353.jpg',
  'frontend/public/20251022_1333_ورشة كتابة في الفضاء_simple_compose_01k85qkqbhe9b8ews92f9m2ec3.png',
  'frontend/public/directors-studio/Clapperboard_placeholder_icon_998165d7.png',
  'frontend/public/directors-studio/Film_production_hero_image_6b2179d4.png',
  'frontend/public/directors-studio/Production_planning_workspace_bd58f042.png',
  'frontend/public/images/fallback.jpg',
];

async function optimizeImage(imagePath) {
  const fullPath = path.join(__dirname, '..', imagePath);

  if (!fs.existsSync(fullPath)) {
    console.log("⚠️  File not found");
    return;
  }

  const ext = path.extname(fullPath).toLowerCase();
  const originalSize = fs.statSync(fullPath).size;

  console.log("\n🔄 Optimizing image");
  console.log(`   Original size: ${(originalSize / 1024).toFixed(2)} KB`);

  try {
    const image = sharp(fullPath);
    const metadata = await image.metadata();

    // Create a temporary file for the optimized version
    const tempPath = fullPath + '.temp';

    if (ext === '.png') {
      // Optimize PNG images
      await image
        .png({
          quality: 80,
          compressionLevel: 9,
          palette: true // Use palette if possible for smaller size
        })
        .toFile(tempPath);
    } else if (ext === '.jpg' || ext === '.jpeg') {
      // Optimize JPEG images
      await image
        .jpeg({
          quality: 85,
          mozjpeg: true
        })
        .toFile(tempPath);
    } else {
      console.log("   Skipping unsupported format");
      return;
    }

    const optimizedSize = fs.statSync(tempPath).size;
    const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

    console.log(`   Optimized size: ${(optimizedSize / 1024).toFixed(2)} KB`);
    console.log(`   Savings: ${savings}%`);

    // Replace original with optimized version if it's actually smaller
    if (optimizedSize < originalSize) {
      fs.renameSync(tempPath, fullPath);
      console.log(`   ✅ Optimized successfully!`);
    } else {
      fs.unlinkSync(tempPath);
      console.log(`   ⚠️  Original is already optimal (keeping original)`);
    }
  } catch (error) {
    console.error("   ❌ Error optimizing image");
  }
}

async function main() {
  console.log('🎨 Starting image optimization...\n');
  console.log('═'.repeat(60));

  for (const imagePath of images) {
    await optimizeImage(imagePath);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✨ Image optimization complete!\n');
}

main().catch(console.error);
