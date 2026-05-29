const Jimp = require('jimp');

async function makeCircle() {
  const image = await Jimp.read('./assets/logo_inside.png');
  const size = Math.min(image.bitmap.width, image.bitmap.height);
  
  // Crop to square if it isn't
  image.crop(
    (image.bitmap.width - size) / 2,
    (image.bitmap.height - size) / 2,
    size,
    size
  );
  
  // Create a circle mask
  image.circle();
  
  await image.writeAsync('./assets/logo_inside.png');
  console.log('Successfully made logo_inside round with transparent background.');
}

makeCircle().catch(console.error);
