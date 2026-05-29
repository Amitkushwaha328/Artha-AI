const fs = require('fs');
const content = fs.readFileSync('generate_doc.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('onboard') || line.includes('Onboard')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
