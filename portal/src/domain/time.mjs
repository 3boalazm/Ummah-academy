/** Timezone helpers. Instants are always UTC ISO strings; local clocks are a view. */

export function tzOffsetMs(instant, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(instant).filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]),
  );
  const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return asUTC - instant.getTime();
}

/** Calendar components interpreted in `timeZone`, returned as a UTC Date. */
export function zonedLocalToUtc(year, month, day, hour, minute, timeZone) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  let utc = utcGuess;
  for (let i = 0; i < 3; i++) utc = utcGuess - tzOffsetMs(new Date(utc), timeZone);
  return new Date(utc);
}

export function localParts(instant, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(instant).filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]),
  );
  return {
    year: +parts.year,
    month: +parts.month,
    day: +parts.day,
    hour: +parts.hour,
    minute: +parts.minute,
    weekday: parts.weekday,
  };
}

/** Local clock on the calendar day of `base` in `timeZone`, shifted by `dayOffset`. */
export function localOn(base, dayOffset, hour, minute, timeZone) {
  const parts = localParts(base, timeZone);
  const shifted = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + dayOffset));
  return zonedLocalToUtc(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate(), hour, minute, timeZone);
}

export function rangesOverlap(aStart, aEnd, bStart, bEnd, bufferMin = 0) {
  const buf = bufferMin * 60 * 1000;
  return aStart.getTime() < bEnd.getTime() + buf && bStart.getTime() < aEnd.getTime() + buf;
}

export function addMs(iso, ms) {
  return new Date(new Date(iso).getTime() + ms).toISOString();
}

export function addDays(iso, days) {
  return addMs(iso, days * 24 * 60 * 60 * 1000);
}
