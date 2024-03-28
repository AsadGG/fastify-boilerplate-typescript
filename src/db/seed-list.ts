import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function listSeeds(): Promise<void> {
  const resolvedPath = path.resolve(__dirname, 'seeds');
  const files = await fs.readdir(resolvedPath);

  if (files.length) {
    console.log(chalk.green(`Found ${files.length} Seed file/files.`));
  } else {
    console.log(chalk.red(`No Seed file Found.`));
  }

  files.forEach((file) => {
    console.log(chalk.blue(file));
  });

  process.exit(0);
}

listSeeds();
