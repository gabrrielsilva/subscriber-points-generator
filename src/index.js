import csv from '@fast-csv/parse';
import Drawing from 'dxf-writer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let drawing = new Drawing();

fs.createReadStream(path.resolve(__dirname, '..', 'public', 'parse.csv'))
  .pipe(csv.parse({ headers: false }))
  .on('error', (error) => console.error(error))
  .on('data', async (row) => {
    const id = row[0],
           x = row[1],
           y = row[2];

    draw(id, x, y);
  })
  .on('end', async () => {
    setTimeout(() => {
      fs.writeFileSync(path.resolve(__dirname, '..', 'export', 'output.dxf'), drawing.toDxfString());
    }, 1500)
  });

function draw(id, x, y) {
  drawing.setUnits('Millimeters');
  drawing.drawCircle(Number(x), Number(y), 0.0001);
  drawing.drawText(Number(x) + 0.0003, Number(y), 0.00006, 0, id);
}