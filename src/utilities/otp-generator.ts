function baseRandom(lower: number, upper: number) {
  return lower + Math.floor(Math.random() * (upper - lower + 1));
}

function arraySample<T = any>(array: Array<T>) {
  return array.length ? array[baseRandom(0, array.length - 1)] : undefined;
}

const NUMBERS_AND_LETTERS = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

function getLetterOrNumber() {
  return arraySample(NUMBERS_AND_LETTERS);
}

export function generate(amount = 1) {
  if (amount > NUMBERS_AND_LETTERS.length) {
    throw new Error(
      `amount can not be greater than ${NUMBERS_AND_LETTERS.length}`
    );
  }

  const randomNumbersAndLetters = new Set();
  while (randomNumbersAndLetters.size !== amount) {
    randomNumbersAndLetters.add(getLetterOrNumber());
  }
  return [...randomNumbersAndLetters].join('');
}
