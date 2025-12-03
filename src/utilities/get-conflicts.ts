import camelCase from 'lodash/camelCase.js';

export default function getConflicts(errorMessage: string) {
  const regex = /Key \((.+)\)=\((.+)\) .* ./i;

  const regExpExecArray = regex.exec(errorMessage);

  const errorObject: Record<string, string> = {};

  if (regExpExecArray) {
    const keys = regExpExecArray[1].split(', ');
    const values = regExpExecArray[2].split(', ');

    for (const [index, key_] of keys.entries()) {
      const key = camelCase(key_);
      const value = values[index];

      errorObject[key] = value;
    }
  }

  return errorObject;
}
