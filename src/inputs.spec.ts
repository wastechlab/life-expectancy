import { checkBirthDate, checkOwnExpectancy } from './inputs';

describe('checkOwnExpectancy', () => {
    for (const [value, problem] of [
        [0, 'below-min'],
        [1, null],
        [120, null],
        [121, 'above-max'],
        [NaN, 'not-a-number'],
    ] as const) {
        it(`gives ${problem} for ${value}`, () => {
            expect(checkOwnExpectancy(value)).toBe(problem);
        });
    }
});

describe('checkBirthDate', () => {
    const now = new Date(2026, 10, 10, 12, 0);

    it('accepts yesterday, even late in the evening', () => {
        expect(checkBirthDate(new Date(2026, 10, 9, 23, 59), now)).toBeNull();
    });

    it('refuses today, even earlier in the day', () => {
        expect(checkBirthDate(new Date(2026, 10, 10, 0, 1), now)).toBe('not-in-past');
    });

    it('refuses a future date', () => {
        expect(checkBirthDate(new Date(2027, 0, 1), now)).toBe('not-in-past');
    });
});
