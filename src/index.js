import csv from '@fast-csv/parse';
import Drawing from 'dxf-writer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let drawing = new Drawing();

const dxfFile = path.resolve(__dirname, '..', 'export', 'output.dxf');
const csvFile = path.resolve(__dirname, '..', 'public', 'parse.csv')

fs.createReadStream(csvFile)
  .pipe(csv.parse({ headers: false }))
  .on('error', (error) => console.error(error))
  .on('data', async (row) => {
    const id = row[0],
           x = row[1],
           y = row[2];

    draw(id, Number(x), Number(y));
  })
  .on('end', async () => {
    setTimeout(() => {
      fs.writeFileSync(dxfFile, drawing.toDxfString())
    }, 2000)
  });

function draw(id, x, y) {
  drawing.setUnits('Millimeters');
  drawing.drawText(x, y, 0.00006, 0, id);
  // drawing.drawText(x + 0.0002, y, 0.00006, 0, id);
  // drawing.drawCircle(x, y, 0.0001);
}