import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildIndex() {
  const packsDir = path.join(__dirname, 'public', 'packs');
  const packsJsonPath = path.join(packsDir, 'packs.json');
  const packs = JSON.parse(fs.readFileSync(packsJsonPath, 'utf-8'));

  const index = {
    packs: [],
    characters: {},
  };

  for (const pack of packs) {
    const manifestPath = path.join(packsDir, pack.folder, '_packinfo.json');
    if (!fs.existsSync(manifestPath)) continue;

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const characters = [];

    for (const fileInfo of manifest.files) {
      const dataPath = path.join(packsDir, pack.folder, fileInfo.file);
      if (!fs.existsSync(dataPath)) continue;

      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      const subPack = fileInfo.subPackName;
      const displayPack = subPack ? `${manifest.displayName || pack.folder} - ${subPack}` : (manifest.displayName || pack.folder);

      data.forEach(char => {
        if (char && typeof char === 'object') {
          characters.push({
            ...char,
            displayPack,
          });
        }
      });
    }

    index.packs.push(pack);
    index.characters[pack.id] = characters;
  }

  const outputPath = path.join(__dirname, 'public', 'packs', 'index.json');
  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
  console.log('Index built at', outputPath);
}

buildIndex().catch(console.error);