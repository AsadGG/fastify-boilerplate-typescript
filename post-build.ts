import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const packageJsonExist = existsSync('package.json');
if (!packageJsonExist) {
  console.error('package.json does not exist');
  process.exit(1);
}
const data = readFileSync('package.json');
const json = JSON.parse(data.toString());
delete json.devDependencies;
json.scripts = {
  start: 'node index.js',
};
writeFileSync('dist/package.json', JSON.stringify(json, undefined, 2));
