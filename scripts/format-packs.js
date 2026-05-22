import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const packsDir = path.join(projectRoot, 'public', 'packs');
const packsJsonPath = path.join(packsDir, 'packs.json');

// Characters in overseas_if.json that are missing gender but are Male (男)
const missingMaleGenders = new Set([
  '国际幻诸葛亮',
  '国际幻赵云',
  '国际幻张郃',
  '国际幻姜维',
  '国际幻司马懿',
  '国际幻魏延',
  '国际幻刘禅',
  '国际幻陆逊',
  '国际幻曹昂'
]);

function formatJSONFile(filePath, processDataFn) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    console.error(`Failed to parse JSON file ${filePath}: ${e.message}`);
    return;
  }

  if (processDataFn) {
    data = processDataFn(data);
  }

  // Prettify with 2 spaces
  const formatted = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, formatted + '\n', 'utf-8');
  console.log(`Formatted: ${path.relative(projectRoot, filePath)}`);
}

function normalizeCharacter(char) {
  if (!char || typeof char !== 'object') return char;

  // 1. Normalize missing genders
  if (!char.gender && missingMaleGenders.has(char.name)) {
    char.gender = '男';
  }

  // 2. Normalize dual-gender terminology
  if (char.gender === 'Bigender') {
    char.gender = '双';
  }

  // 3. Normalize skill object keys
  if (char.skills && Array.isArray(char.skills)) {
    char.skills = char.skills.map(skill => {
      if (!skill || typeof skill !== 'object') return skill;
      const orderedSkill = {};
      const skillKeys = ['skillName', 'skillDescription'];
      skillKeys.forEach(k => {
        if (skill[k] !== undefined && skill[k] !== null) {
          orderedSkill[k] = skill[k];
        }
      });
      // Append any other fields if they exist
      Object.keys(skill).forEach(k => {
        if (!skillKeys.includes(k)) {
          orderedSkill[k] = skill[k];
        }
      });
      return orderedSkill;
    });
  }

  // 4. Sort character keys strictly
  const orderedChar = {};
  const charKeys = [
    'name',
    'title',
    'faction',
    'faction2',
    'gender',
    'health',
    'startingHealth',
    'initialArmor',
    'image',
    'skills'
  ];

  charKeys.forEach(k => {
    if (char[k] !== undefined && char[k] !== null) {
      orderedChar[k] = char[k];
    }
  });

  // Append any other runtime or customized keys
  Object.keys(char).forEach(k => {
    if (!charKeys.includes(k)) {
      orderedChar[k] = char[k];
    }
  });

  return orderedChar;
}

function run() {
  console.log('Starting data refactoring & formatting...\n');

  // Format packs.json
  formatJSONFile(packsJsonPath, (packs) => {
    return packs.map(pack => {
      const orderedPack = {};
      const packKeys = ['id', 'folder', 'nameForCheckbox'];
      packKeys.forEach(k => {
        if (pack[k] !== undefined) orderedPack[k] = pack[k];
      });
      return orderedPack;
    });
  });

  // Load packs list
  const packs = JSON.parse(fs.readFileSync(packsJsonPath, 'utf-8'));

  for (const pack of packs) {
    const packFolder = path.join(packsDir, pack.folder);
    const manifestPath = path.join(packFolder, '_packinfo.json');

    if (!fs.existsSync(manifestPath)) {
      console.warn(`[Warning] Missing _packinfo.json in folder ${pack.folder}`);
      continue;
    }

    // Format _packinfo.json
    formatJSONFile(manifestPath, (manifest) => {
      const orderedManifest = {};
      if (manifest.displayName !== undefined) {
        orderedManifest.displayName = manifest.displayName;
      }
      if (manifest.files && Array.isArray(manifest.files)) {
        orderedManifest.files = manifest.files.map(fileInfo => {
          const orderedFile = {};
          const fileKeys = ['file', 'subPackName'];
          fileKeys.forEach(k => {
            if (fileInfo[k] !== undefined) orderedFile[k] = fileInfo[k];
          });
          return orderedFile;
        });
      }
      return orderedManifest;
    });

    // Format individual JSON data files
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    for (const fileInfo of manifest.files) {
      const filePath = path.join(packFolder, fileInfo.file);
      formatJSONFile(filePath, (characters) => {
        if (Array.isArray(characters)) {
          return characters.map(normalizeCharacter);
        }
        return characters;
      });
    }
  }

  console.log('\nFormatting and refactoring completed successfully.');
}

run();
