export { eventStamp } from '../caja-de-regalo/clock.mjs';
import { eventStamp } from '../caja-de-regalo/clock.mjs';
export function countdown(config, now = new Date()) {
  const target = new Date(eventStamp(config));
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: config.zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  if (date.format(now) === date.format(target)) return config.copy.today;
  const minutes = Math.ceil((target - now) / 60000);
  if (minutes <= 0) return config.copy.past;
  if (minutes < 1440)
    return config.copy.hours
      .replace('{h}', Math.floor(minutes / 60))
      .replace('{m}', minutes % 60);
  return config.copy.days.replace('{n}', Math.ceil(minutes / 1440));
}
