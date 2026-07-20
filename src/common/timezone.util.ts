import { BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';

export function assertValidTimezone(timezone: string): void {
  if (!DateTime.now().setZone(timezone).isValid) {
    throw new BadRequestException(
      `Invalid timezone "${timezone}". Use IANA format (e.g. Asia/Kolkata).`,
    );
  }
}

/** UTC range for a local calendar day in the given IANA timezone. */
export function localDayBoundsUtc(
  date: string,
  timezone: string,
): { from: Date; to: Date } {
  assertValidTimezone(timezone);

  const start = DateTime.fromISO(date, { zone: timezone }).startOf('day');
  const end = DateTime.fromISO(date, { zone: timezone }).endOf('day');

  if (!start.isValid || !end.isValid) {
    throw new BadRequestException(
      `Invalid date "${date}". Use YYYY-MM-DD format.`,
    );
  }

  return { from: start.toUTC().toJSDate(), to: end.toUTC().toJSDate() };
}

/** Local hour (0–23) for a UTC instant in the given IANA timezone. */
export function localHour(utcDate: Date, timezone: string): number {
  assertValidTimezone(timezone);
  return DateTime.fromJSDate(utcDate, { zone: 'utc' })
    .setZone(timezone)
    .hour;
}

/** Format hour as local label, e.g. "09:00". */
export function formatLocalHourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}
