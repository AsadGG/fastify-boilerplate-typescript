import { PathLike } from 'fs';
import { readdir, stat } from 'fs/promises';
import { dirname, join } from 'path';
import { SonicBoom, SonicBoomOpts } from 'sonic-boom';

export default async function (
  {
    file,
    size,
    frequency,
    extension,
    ...opts
  }: {
    file: string;
    size: any;
    frequency: any;
    extension: any;
  } & Partial<SonicBoomOpts> = {} as any
) {
  const frequencySpec = parseFrequency(frequency);

  let number = await detectLastNumber(file, frequencySpec?.start);

  let currentSize = 0;
  const maxSize = parseSize(size);

  const destination = new SonicBoom({
    ...opts,
    dest: buildFileName(file, number, extension),
  });

  let rollTimeout: NodeJS.Timeout | undefined;
  if (frequencySpec) {
    destination.once('close', () => {
      clearTimeout(rollTimeout);
    });
    scheduleRoll();
  }

  if (maxSize) {
    destination.on('write', (writtenSize) => {
      currentSize += writtenSize;
      if (currentSize >= maxSize) {
        currentSize = 0;
        // delay to let the our destination finish its write
        setTimeout(roll, 0);
      }
    });
  }

  function roll() {
    destination.reopen(buildFileName(file, ++number, extension));
  }

  function scheduleRoll() {
    clearTimeout(rollTimeout);
    rollTimeout = setTimeout(
      () => {
        roll();
        frequencySpec.next = getNext(frequency);
        scheduleRoll();
      },
      (frequencySpec?.next ?? 0) - Date.now()
    );
  }

  return destination;
}

function parseSize(size: string | number) {
  let multiplier = 1024 ** 2;
  if (typeof size !== 'string' && typeof size !== 'number') {
    return null;
  }
  if (typeof size === 'string') {
    const match = size.match(/^([\d.]+)(\w?)$/);
    if (match) {
      const unit = match[2]?.toLowerCase();
      size = +match[1];
      multiplier =
        unit === 'g'
          ? 1024 ** 3
          : unit === 'k'
            ? 1024
            : unit === 'b'
              ? 1
              : 1024 ** 2;
    } else {
      throw new Error(`${size} is not a valid size in KB, MB or GB`);
    }
  }
  return size * multiplier;
}

function buildFileName(fileName: string, lastNumber = 1, extension: string) {
  if (!fileName) {
    throw new Error('No file name provided');
  }
  let newFileName = fileName;
  if (fileName.match('%DATE%')) {
    const dateString = new Date().toISOString().split('T')[0];
    newFileName = `${fileName.replace('%DATE%', `-${dateString}`)}`;
  }
  return `${newFileName}.${lastNumber}${extension ?? ''}`;
}

function getNextDay(start: number) {
  return new Date(start + 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0);
}

function getNextHour(start: number) {
  return new Date(start + 60 * 60 * 1000).setMinutes(0, 0, 0);
}

function getNextCustom(frequency: number) {
  return Date.now() + frequency;
}

function getNext(frequency: 'daily' | 'hourly' | number) {
  if (frequency === 'daily') {
    return getNextDay(new Date().setHours(0, 0, 0, 0));
  }
  if (frequency === 'hourly') {
    return getNextHour(new Date().setMinutes(0, 0, 0));
  }
  return getNextCustom(frequency);
}

function parseFrequency(frequency: 'daily' | 'hourly' | number) {
  const today = new Date();
  if (frequency === 'daily') {
    const start = today.setHours(0, 0, 0, 0);
    return { frequency, start, next: getNextDay(start) };
  }
  if (frequency === 'hourly') {
    const start = today.setMinutes(0, 0, 0);
    return { frequency, start, next: getNextHour(start) };
  }
  if (typeof frequency === 'number') {
    return { frequency, next: getNextCustom(frequency) };
  }
  if (frequency) {
    throw new Error(
      `${frequency} is neither a supported frequency or a number of milliseconds`
    );
  }
  return {};
}

async function isMatchingTime(filePath: PathLike, time: number) {
  const { birthtimeMs } = await stat(filePath);
  return birthtimeMs >= time;
}

function extractTrailingNumber(fileName: string) {
  const match = fileName.match(/(.\d+)$/);
  return match ? +match[1] : null;
}

async function readFileTrailingNumbers(folder: string, time: number | null) {
  const numbers = [1];
  for (const file of await readdir(folder)) {
    if (time && !(await isMatchingTime(join(folder, file), time))) {
      continue;
    }
    const number = extractTrailingNumber(file);
    if (number) {
      numbers.push(number);
    }
  }
  return numbers;
}

async function detectLastNumber(fileName: string, time: number | null = null) {
  try {
    const numbers = await readFileTrailingNumbers(dirname(fileName), time);
    return numbers.sort((a, b) => b - a)[0];
  } catch {
    return 1;
  }
}
