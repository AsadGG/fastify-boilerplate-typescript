function secureRandom(max: number) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % (max + 1);
}

function stringSample(string_: string) {
  return string_.charAt(secureRandom(string_.length - 1));
}

const NUMBERS = '0123456789';
const UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS_AND_UPPERCASE_LETTERS = NUMBERS + UPPERCASE_LETTERS;
const NUMBERS_AND_LETTERS = NUMBERS + UPPERCASE_LETTERS + LOWERCASE_LETTERS;

export function generateOtp(length = 6, unique = false): string {
  if (unique && length > NUMBERS_AND_UPPERCASE_LETTERS.length) {
    throw new Error(
      `Length can not be greater than ${NUMBERS_AND_UPPERCASE_LETTERS.length}`,
    );
  }

  if (unique) {
    const randomChars = new Set<string>();
    while (randomChars.size < length) {
      randomChars.add(stringSample(NUMBERS_AND_UPPERCASE_LETTERS));
    }
    return [...randomChars].join('');
  }

  return Array.from({ length }, () =>
    stringSample(NUMBERS_AND_UPPERCASE_LETTERS)).join('');
}

export function generateRandomPassword(length = 8) {
  return Array.from({ length }, () => stringSample(NUMBERS_AND_LETTERS)).join(
    '',
  );
}
