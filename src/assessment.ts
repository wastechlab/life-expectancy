import { ALGORITHM } from './data.js';
import { countryAverage } from './countries.js';
import { ageAt, futureDates } from './dates.js';
import { cigarettesActive } from './tobacco.js';
import { Algorithm, AlgorithmOption, AlgorithmQuestion, AssessmentInput, AssessmentResult } from './types.js';

const LATE_AGE = 80;
const LATE_AGE_SPAN = 5;
const REFERENCE_EXPECTANCY = 85;
/** Width of the range in percent of the adjusted age, split evenly around it. */
const RANGE_WIDTH_PERCENT = 5;

/** Percent of each answer's weight that counts, by years left at the base. */
function adjustmentRatio(remainingAge: number): number {
    if (remainingAge > 95) {
        return 60;
    }
    if (remainingAge > 90) {
        return 65;
    }
    if (remainingAge > 85) {
        return 75;
    }
    if (remainingAge > 80) {
        return 85;
    }
    return 100;
}

function chosenOption(question: AlgorithmQuestion | undefined, answer: string | null | undefined): AlgorithmOption | undefined {
    return question?.options.find(option => option.id === answer);
}

/** The range of ages the answers point to, or the reason there is none. */
export function assess(input: AssessmentInput, algorithm: Algorithm = ALGORITHM): AssessmentResult {
    const currentAge = ageAt(input.birthDate, input.now);
    const averageAge = currentAge > LATE_AGE
        ? currentAge + LATE_AGE_SPAN
        : ((countryAverage(input.countries, input.sex) ?? 0) + REFERENCE_EXPECTANCY + input.ownExpectancy) / 3;
    let remainingAge = averageAge - currentAge;
    if (!Number.isFinite(remainingAge) || remainingAge <= 0) {
        return { issue: 'base-exhausted' };
    }

    const ratio = adjustmentRatio(remainingAge);
    const shift = (option: AlgorithmOption | undefined): void => {
        if (option && option.weight !== null) {
            const percentage = option.weight * ratio / averageAge;
            remainingAge += remainingAge * percentage / 100;
        }
    };

    const { questionId, cigarettesQuestionId } = algorithm.tobacco;
    for (const question of algorithm.questions) {
        if (question.id !== questionId && question.id !== cigarettesQuestionId) {
            shift(chosenOption(question, input.answers[question.id]));
        }
    }
    // Tobacco goes last and only once: the two questions describe the same habit and must not both count.
    const tobaccoId = cigarettesActive(input.answers[questionId] ?? null, algorithm) ? cigarettesQuestionId : questionId;
    shift(chosenOption(algorithm.questions.find(question => question.id === tobaccoId), input.answers[tobaccoId]));

    const finalAge = remainingAge + currentAge;
    const range = {
        minAge: finalAge - finalAge * RANGE_WIDTH_PERCENT / 2 / 100,
        maxAge: finalAge + finalAge * RANGE_WIDTH_PERCENT / 2 / 100,
        currentAge,
    };

    return futureDates(range, input.now) ? { range } : { issue: 'range-not-future' };
}
