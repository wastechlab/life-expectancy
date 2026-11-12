import { ageAt, futureDates, MILLISECONDS_PER_YEAR } from './dates';
import { AssessmentRange } from './types';

describe('ageAt', () => {
    it('counts years of 365.25 days', () => {
        const birth = new Date('2000-01-01T00:00:00.000Z');

        expect(ageAt(birth, new Date(birth.getTime() + 10 * MILLISECONDS_PER_YEAR))).toBe(10);
        expect(ageAt(birth, new Date('2000-07-02T00:00:00.000Z'))).toBeCloseTo(183 / 365.25, 12);
    });
});

describe('futureDates', () => {
    const now = new Date(Date.UTC(2026, 10, 1, 12));
    const range: AssessmentRange = { currentAge: 75, minAge: 76, maxAge: 77 };

    it('places both ends of a wholly future range ahead of now by the years left', () => {
        expect(futureDates(range, now)).toEqual({
            min: new Date('2027-11-01T18:00:00.000Z'),
            max: new Date('2028-11-01T00:00:00.000Z'),
        });
    });

    for (const [name, invalid] of [
        ['absent', null],
        ['partly past', { ...range, minAge: 74 }],
        ['starting now', { ...range, minAge: 75 }],
        ['wholly past', { ...range, minAge: 70, maxAge: 74 }],
        ['inverted', { ...range, maxAge: 75.5 }],
        ['invalid lower age', { ...range, minAge: NaN }],
        ['infinite upper age', { ...range, maxAge: Infinity }],
        ['invalid current age', { ...range, currentAge: NaN }],
        ['unrepresentable as dates', { ...range, minAge: 1e100, maxAge: 1e101 }],
        ['not later at millisecond precision', { ...range, minAge: 75 + 1e-14 }],
    ] as [string, AssessmentRange][]) {
        it(`has nothing for a range that is ${name}`, () => {
            expect(futureDates(invalid, now)).toBeNull();
        });
    }

    it('accepts an equal pair of future bounds', () => {
        const dates = futureDates({ ...range, maxAge: range.minAge }, now);

        expect(dates?.min.getTime()).toBe(dates?.max.getTime());
    });

    it('has nothing for an invalid reference time', () => {
        expect(futureDates(range, new Date(NaN))).toBeNull();
    });
});
