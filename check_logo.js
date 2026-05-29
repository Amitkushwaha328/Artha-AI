const Jimp = require('jimp');

async function checkImage() {
  const image = await Jimp.read('./assets/splash_logo.png');
  const color = Jimp.intToRGBA(image.getPixelColor(0, 0));
  console.log('Pixel at 0,0:', color);
}

checkImage().catch(console.error);
