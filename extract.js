const fs = require('fs');
const path = require('path');

const docFilePath = path.join(__dirname, 'generate_doc.js');
if (!fs.existsSync(docFilePath)) {
  console.error('generate_doc.js not found');
  process.exit(1);
}

const content = fs.readFileSync(docFilePath, 'utf8');

let index = 0;
while (true) {
  const fileTagIndex = content.indexOf('fileTag(', index);
  if (fileTagIndex === -1) break;

  // Find start quote of filename
  const startQuoteIndex = content.indexOf('"', fileTagIndex);
  const startQuoteIndex2 = content.indexOf("'", fileTagIndex);
  let qIdx = -1;
  let qChar = '"';
  if (startQuoteIndex !== -1 && (startQuoteIndex2 === -1 || startQuoteIndex < startQuoteIndex2)) {
    qIdx = startQuoteIndex;
    qChar = '"';
  } else {
    qIdx = startQuoteIndex2;
    qChar = "'";
  }

  if (qIdx === -1) {
    index = fileTagIndex + 8;
    continue;
  }

  const endQuoteIndex = content.indexOf(qChar, qIdx + 1);
  let filename = content.slice(qIdx + 1, endQuoteIndex);
  
  // Strip any extra descriptions
  if (filename.includes(' ')) {
    filename = filename.split(' ')[0];
  }

  console.log(`Found file tag: ${filename}`);

  // Find the next `...code([`
  const codeStartIndex = content.indexOf('...code([', endQuoteIndex);
  if (codeStartIndex === -1) {
    index = endQuoteIndex + 1;
    continue;
  }

  // Walk and find the matching `]` of the array
  const arrayStart = codeStartIndex + 8; // Index of `[`
  let bracketCount = 0;
  let walkIndex = arrayStart;
  let inString = false;
  let stringChar = '';

  while (walkIndex < content.length) {
    const char = content[walkIndex];
    if (inString) {
      if (char === '\\') {
        walkIndex += 2;
        continue;
      }
      if (char === stringChar) {
        inString = false;
      }
    } else {
      if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
      } else if (char === '[') {
        bracketCount++;
      } else if (char === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          break;
        }
      }
    }
    walkIndex++;
  }

  const arrayContent = content.slice(arrayStart, walkIndex + 1);
  
  try {
    const lines = eval(arrayContent);
    if (Array.isArray(lines)) {
      const outputFilePath = path.join(__dirname, filename);
      fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
      fs.writeFileSync(outputFilePath, lines.join('\n'), 'utf8');
      console.log(`Successfully wrote ${lines.length} lines to ${outputFilePath}`);
    }
  } catch (err) {
    console.error(`Failed to parse array content for ${filename}:`, err);
  }

  index = walkIndex + 2;
}

console.log('Extraction completed successfully!');
