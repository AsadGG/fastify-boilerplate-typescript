import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fileExists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function seedRun() {
  const argumentSeparatorIndex = process.argv.findIndex(
    (item) => item === '--'
  );
  const seedNames = process.argv.slice(-argumentSeparatorIndex + 1);

  if (!seedNames.length) {
    console.error('seed file names not provided');
    process.exit(1);
  }

  const results = seedNames.map(async (seedName) => {
    const seedPath = path.join(__dirname, 'seeds', seedName);

    if (await fileExists(seedPath)) {
      const result = await import(`file://` + seedPath);
      await result.seed();
      return true;
    } else {
      console.log(`file ${seedName} does not exist`);
      return false;
    }
  });

  await Promise.all(results);

  process.exit(0);
}

seedRun();
