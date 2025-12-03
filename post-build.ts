import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const packageJsonExist = existsSync('package.json');
if (!packageJsonExist) {
  throw new Error('package.json does not exist');
}
const data = readFileSync('package.json');
const json = JSON.parse(data.toString());
delete json.devDependencies;
json.scripts = {
  start: 'node index.js',
};
writeFileSync('dist/package.json', JSON.stringify(json, undefined, 2));
