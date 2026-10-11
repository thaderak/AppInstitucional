const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height) {
  // RGBA buffer: width * 4 per row + 1 filter byte per row
  const rowLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowLength);

  const bgR = 0, bgG = 51, bgB = 160; // SENATI #0033A0
  const whiteR = 255, whiteG = 255, whiteB = 255;
  const accentR = 255, accentG = 180, accentB = 0; // Gold accent

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * 0.44;
  const rInner = width * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = bgR, g = bgG, b = bgB, a = 255;

      // Outer ring / rounded badge
      if (dist <= rOuter && dist >= rOuter - 6) {
        r = accentR; g = accentG; b = accentB;
      } else if (dist < rOuter && dist > rInner) {
        r = bgR; g = bgG; b = bgB;
      }

      // Drawing stylized SENATI "S" and gear/shield in the center
      // Center box for "S"
      const nx = (x - cx) / (width * 0.28); // -1 to 1 approx
      const ny = (y - cy) / (height * 0.28);

      // Simple elegant S shape
      const inS1 = (ny >= -0.9 && ny <= -0.5 && nx >= -0.7 && nx <= 0.7); // top bar
      const inS2 = (ny >= -0.7 && ny <= 0.0 && nx >= -0.7 && nx <= -0.3); // top left spine
      const inS3 = (ny >= -0.2 && ny <= 0.2 && nx >= -0.7 && nx <= 0.7); // mid bar
      const inS4 = (ny >= 0.0 && ny <= 0.7 && nx >= 0.3 && nx <= 0.7); // bottom right spine
      const inS5 = (ny >= 0.5 && ny <= 0.9 && nx >= -0.7 && nx <= 0.7); // bottom bar

      if (inS1 || inS2 || inS3 || inS4 || inS5) {
        r = whiteR; g = whiteG; b = whiteB;
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcData = Buffer.alloc(4 + len);
  chunk.copy(crcData, 0, 4, 8 + len);
  const crcVal = crc32(crcData);
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const targetDirs = [
  path.join(__dirname, '../public/assets/icons'),
  path.join(__dirname, '../public/icons'),
  path.join(__dirname, '../src/assets/icons')
];

for (const dir of targetDirs) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'icon-192x192.png'), createPng(192, 192));
  fs.writeFileSync(path.join(dir, 'icon-512x512.png'), createPng(512, 512));
  console.log('Generated icons in:', dir);
}
