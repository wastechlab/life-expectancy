import { AssessmentRange } from './types.js';

export const MILLISECONDS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/** Age in fractional years; a year is 365.25 days, so leap years average out. */
export function ageAt(birthDate: Date, now: Date): number {
    return (now.getTime() - birthDate.getTime()) / MILLISECONDS_PER_YEAR;
}

/** The calendar moments the range points at, or `null` when any part of it is not after `now`. */
export function futureDates(range: AssessmentRange, now: Date): { min: Date; max: Date } | null {
    const nowTime = now.getTime();
    if (!range || ![range.minAge, range.maxAge, range.currentAge, nowTime].every(Number.isFinite)
        || range.minAge <= range.currentAge || range.maxAge < range.minAge) {
        return null;
    }

    const min = new Date(nowTime + (range.minAge - range.currentAge) * MILLISECONDS_PER_YEAR);
    const max = new Date(nowTime + (range.maxAge - range.currentAge) * MILLISECONDS_PER_YEAR);

    // A Date keeps whole milliseconds, so a lower end a fraction of a millisecond ahead still lands on now.
    return min.getTime() > nowTime && max.getTime() >= min.getTime() ? { min, max } : null;
}
