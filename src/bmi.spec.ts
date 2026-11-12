import { BMI_LIMITS, bmi, nearestBmiOption } from './bmi';
import { ALGORITHM } from './data';

describe('bmi', () => {
    it('divides kilograms by metres squared', () => {
        expect(bmi({ system: 'metric', heightCm: 180, weightKg: 80 })).toBe(24.69);
    });

    it('converts pounds over inches squared', () => {
        expect(bmi({ system: 'imperial', heightFt: 5, heightIn: 11, weightLbs: 180 })).toBe(25.1);
    });

    it('has no value for a zero height or weight', () => {
        expect(bmi({ system: 'metric', heightCm: 0, weightKg: 80 })).toBeNull();
        expect(bmi({ system: 'imperial', heightFt: 5, heightIn: 0, weightLbs: 0 })).toBeNull();
    });
});

describe('BMI_LIMITS', () => {
    it('keeps the total imperial height within 3 ft 0 in and 9 ft 0 in', () => {
        expect(BMI_LIMITS.totalHeightIn).toEqual({ min: BMI_LIMITS.heightFt.min * 12, max: BMI_LIMITS.heightFt.max * 12 });
    });
});

describe('nearestBmiOption', () => {
    for (const [value, option] of [
        [18, '<25'],
        [24, '<25'],
        [24.4, '<25'],
        // A tie keeps the first option in the list.
        [24.5, '<25'],
        [24.69, '25'],
        [25, '25'],
        [27.5, '27'],
        [28.69, '29'],
        [29.39, '29'],
        [30.4, '30'],
        [44.9, '44>'],
        [45, '44>'],
        [100, '44>'],
    ] as const) {
        it(`picks ${option} for ${value}`, () => {
            expect(nearestBmiOption(value)).toBe(option);
        });
    }

    for (const value of [0, -29.39, NaN, Infinity, -Infinity, null]) {
        it(`picks nothing for ${value}`, () => {
            expect(nearestBmiOption(value)).toBeNull();
        });
    }

    it('picks nothing from an algorithm without a BMI question', () => {
        expect(nearestBmiOption(29, { tobacco: ALGORITHM.tobacco, questions: [] })).toBeNull();
    });
});
