import camelCase from 'lodash/camelCase';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';
import snakeCase from 'lodash/snakeCase';

export function camelCaseKeys(
  object: Record<string, any> | Array<Record<string, any>>
): Record<string, any> | Array<Record<string, any>> {
  if (isArray(object)) return object.map(camelCaseKeys);
  if (!isPlainObject(object)) return object;
  const result: Record<string, any> = {};
  for (const key in object) {
    const newKey = camelCase(key);
    const value = object[key];
    if (isPlainObject(value)) {
      result[newKey] = camelCaseKeys(value);
    } else if (isArray(value)) {
      result[newKey] = value.map(camelCaseKeys);
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

export function snakeCaseKeys(
  object: Record<string, any> | Array<Record<string, any>>
): Record<string, any> | Array<Record<string, any>> {
  if (isArray(object)) return object.map(snakeCaseKeys);
  if (!isPlainObject(object)) return object;
  const result: Record<string, any> = {};
  for (const key in object) {
    const newKey = snakeCase(key);
    const value = object[key];
    if (isPlainObject(value)) {
      result[newKey] = snakeCaseKeys(value);
    } else if (isArray(value)) {
      result[newKey] = value.map(snakeCaseKeys);
    } else {
      result[newKey] = value;
    }
  }
  return result;
}
