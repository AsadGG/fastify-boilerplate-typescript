import { set } from 'date-fns/set';

export function getTimeAsDateTime(
  time: string,
  date: Date | string | number = new Date()
) {
  const timeRegex = /^\d{1,2}:\d{2}:\d{2}$/;
  const isValidFormat = timeRegex.test(time);
  if (!isValidFormat) {
    throw new Error('invalid format for time must be 00:00:00');
  }
  const [hour, minute, second] = time.split(':');
  return set(date, {
    hours: Number(hour),
    minutes: Number(minute),
    seconds: Number(second),
    milliseconds: 0,
  });
}

export function getDateAsDateTime(date: Date | string | number) {
  return set(date, {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
}
