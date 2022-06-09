import csvParse from '@fast-csv/parse';
import chalk from 'chalk';
import Drawing from 'dxf-writer';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let drawing = new Drawing();

const colors = ['RED', 'GREEN', 'CYAN', 'BLUE', 'MAGENTA', 'WHITE', 'YELLOW'];

const csvDir = path.resolve(__dirname, '..', 'input');
const csvFiles = fs.readdirSync(csvDir);

drawing.setUnits('Millimeters');

(async () => {
  for await (const csv of csvFiles) {
    const question = (name, message, type, choices) => {
      return { name, message, type, choices };
    };

    const selectedCsv = chalk.rgb(219, 40, 119)(`[${csv}]`);
    const answer = await inquirer.prompt([
      question('layerName', `Qual o nome da camada? ${selectedCsv}`),
      question('layerColor', `Qual a cor da camada? ${selectedCsv}`, 'list', colors),
      question('drawCircles', `Desenhar círculos? ${selectedCsv} ${chalk.gray('[S/N]')}`),
    ]);
    const { layerName, layerColor, drawCircles } = answer;

    if (layerName) {
      drawing
        .addLayer(layerName, Drawing.ACI[layerColor ? layerColor : 'WHITE'], 'CONTINUOUS')
        .setActiveLayer(layerName);
    }

    fs.createReadStream(path.resolve(csvDir, csv))
      .pipe(csvParse.parse({ headers: false }))
      .on('error', (error) => console.error(error))
      .on('data', async (row) => {
        const name = row[0];
        const x = row[1];
        const y = row[2];

        drawing.drawText(x, y, 0.000014, 0, name);

        if (drawCircles === 'S') {
          drawing.drawCircle(x, y, 0.00002);
        }
      });
  }

  const dxfFile = path.resolve(__dirname, '..', 'export', 'output.dxf');

  setTimeout(() => {
    fs.writeFileSync(dxfFile, drawing.toDxfString());
  }, 3000);
})();
