import fs from 'node:fs';
import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import { glob } from 'glob';
import { build as pretty } from 'pino-pretty';
import prettyBytes from 'pretty-bytes';

const logFiles = await glob('logs/*.log');

if (logFiles.length === 0) {
  throw new Error(
    `\n${chalk.blue(`Info:No Log Files Found In Logs Folder`)}\n`,
  );
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
  message: 'Select a logger type',
  choices: [
    { name: 'all', value: '' },
    ...loggerTypes.map(loggerType => ({
      name: loggerType,
      value: loggerType,
    })),
  ],
}).catch((error) => {
  throw new Error(`\n${chalk.red(`Error: ${error.message}`)}\n`);
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
  message: 'Select a log file',
  choices: logFilesObject.map(logFile => ({
    name: logFile.name,
    value: logFile.path,
  })),
}).catch((error) => {
  throw new Error(`\n${chalk.red(`Error: ${error.message}`)}\n`);
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
