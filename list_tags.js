const fs = require('fs');
const content = fs.readFileSync('generate_doc.js', 'utf8');
const regex = /fileTag\("([^"]+)"\)/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(match[1]);
}
