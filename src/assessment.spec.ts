import { assess } from './assessment';
import { MILLISECONDS_PER_YEAR } from './dates';
import { Algorithm, AssessmentInput, AssessmentResult } from './types';

// A small algorithm keeps the expected numbers easy to follow by hand.
const algorithm: Algorithm = {
    tobacco: { questionId: 'tobacco', dailyOptionId: 'daily', cigarettesQuestionId: 'cigarettes' },
    questions: [
        { id: 'tobacco', options: [{ id: 'never', weight: 10 }, { id: 'daily', weight: null }] },
        { id: 'cigarettes', options: [{ id: 'none', weight: 0 }, { id: 'pack', weight: -10 }] },
        { id: 'exercise', options: [{ id: 'daily', weight: 6 }] },
    ].map(question => ({
        ...question, label: question.id, question: question.id, required: true, description: '', overview: [], sources: [],
        options: question.options.map(option => ({ ...option, label: option.id })),
    })),
};

const now = new Date('2026-11-10T12:00:00.000Z');

function input(age: number, ownExpectancy: number, answers: AssessmentInput['answers'] = {}): AssessmentInput {
    return {
        birthDate: new Date(now.getTime() - age * MILLISECONDS_PER_YEAR),
        sex: 'male',
        countries: [],
        ownExpectancy,
        answers,
        now,
    };
}

function expectRange(result: AssessmentResult, finalAge: number, currentAge: number): void {
    expect('range' in result).toBe(true);
    if ('range' in result) {
        expect(result.range.minAge).toBeCloseTo(finalAge * 0.975, 9);
        expect(result.range.maxAge).toBeCloseTo(finalAge * 1.025, 9);
        expect(result.range.currentAge).toBeCloseTo(currentAge, 9);
    }
}

describe('assess', () => {
    // Age 40 with no country and an own value of 95 gives a base of (0 + 85 + 95) / 3 = 60, so 20 years left.

    it('returns the base alone when nothing is answered', () => {
        expectRange(assess(input(40, 95), algorithm), 60, 40);
    });

    it('shifts the years left by weight / base for each answer', () => {
        expectRange(assess(input(40, 95, { exercise: 'daily' }), algorithm), 40 + 20 * (1 + 6 / 60), 40);
    });

    it('counts only the cigarettes answer on daily tobacco use', () => {
        expectRange(assess(input(40, 95, { tobacco: 'daily', cigarettes: 'pack' }), algorithm), 40 + 20 * (1 - 10 / 60), 40);
    });

    it('ignores a leftover cigarettes answer once tobacco use is not daily', () => {
        expectRange(assess(input(40, 95, { tobacco: 'never', cigarettes: 'pack' }), algorithm), 40 + 20 * (1 + 10 / 60), 40);
    });

    it('leaves tobacco out while daily use has no cigarettes answer yet', () => {
        expectRange(assess(input(40, 95, { tobacco: 'daily', cigarettes: null }), algorithm), 60, 40);
    });

    it('skips an answer the algorithm does not know', () => {
        expectRange(assess(input(40, 95, { exercise: 'sometimes' }), algorithm), 60, 40);
    });

    it('applies each answer to the years left after the previous ones', () => {
        const afterExercise = 20 * (1 + 6 / 60);
        expectRange(assess(input(40, 95, { exercise: 'daily', tobacco: 'never' }), algorithm), 40 + afterExercise * (1 + 10 / 60), 40);
    });

    it('counts answers at 60% when more than 95 years are left', () => {
        const country = { code: 'XX', name: 'X', male: 88, female: 88, both: 88 };
        const base = (88 + 85 + 120) / 3;
        const result = assess({ ...input(0.5, 120, { exercise: 'daily' }), countries: [country] }, algorithm);

        expectRange(result, 0.5 + (base - 0.5) * (1 + 6 * 60 / base / 100), 0.5);
    });

    it('puts the base five years ahead for someone older than 80, whatever the country and own value', () => {
        expectRange(assess(input(85, 1), algorithm), 90, 85);
    });

    it('reports base-exhausted when the base is not above the current age', () => {
        expect(assess(input(70, 1), algorithm)).toEqual({ issue: 'base-exhausted' });
    });

    it('reports range-not-future when the lower end of the range is already behind', () => {
        // A base of 60.1 at age 60 leaves a tenth of a year, and 2.5% below 60.1 is already past.
        expect(assess(input(60, 95.3), algorithm)).toEqual({ issue: 'range-not-future' });
    });
});
