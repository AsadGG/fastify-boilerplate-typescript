/* eslint-disable no-console */
import fs from 'node:fs';
import process from 'node:process';
import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import { glob } from 'glob';
import { build as pretty } from 'pino-pretty';
import prettyBytes from 'pretty-bytes';

const logFiles = await glob('logs/*.log');

if (!logFiles.length) {
  console.info(
    `\n${chalk.blue(`Info:No Log Files Found In Logs Folder`)}\n`,
  );
  process.exit(0);
}

const loggerTypes = [
  ...new Set(
    logFiles.map((logFiles) => {
      const logFilesSplit = (logFiles.split('\\').pop() as string).split('-');
      return [logFilesSplit[0], logFilesSplit[1]].join('-');
    }),
  ),
];

const loggerType = await select({
  choices: [
    { name: 'all', value: '' },
    ...loggerTypes.map(loggerType => ({
      name: loggerType,
      value: loggerType,
    })),
  ],
  message: 'Select A Logger Type',
}).catch((e) => {
  console.error(`\n${chalk.red(`Error: ${e.message}`)}\n`);
  process.exit(0);
});

const logFilesObjectPromise = logFiles
  .filter(logFilePath => logFilePath.includes(loggerType))
  .map(async (logFilePath) => {
    const fileStats = await fs.promises.stat(logFilePath);
    const fileSize = fileStats.size;
    return {
      name: `name: ${logFilePath.split('\\').pop()} size: ${prettyBytes(
        fileSize,
      )}`,
      path: logFilePath,
    };
  });

const logFilesObject = await Promise.all(logFilesObjectPromise);

const filePath = await select({
  choices: logFilesObject.map(logFile => ({
    name: logFile.name,
    value: logFile.path,
  })),
  message: 'Select A Log File',
}).catch((e) => {
  console.error(`\n${chalk.red(`Error: ${e.message}`)}\n`);
  process.exit(0);
});

const readableStream = fs.createReadStream(filePath, {
  encoding: 'utf8',
});

const prettyStream = pretty({
  append: false,
  colorize: false,
  destination: `${filePath}.readable`,
});

for await (const line of readableStream) {
  prettyStream.write(line);
}
