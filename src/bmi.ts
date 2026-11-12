import { ALGORITHM } from './data.js';
import { Algorithm } from './types.js';

export interface MetricMeasure {
    system: 'metric';
    heightCm: number;
    weightKg: number;
}

export interface ImperialMeasure {
    system: 'imperial';
    heightFt: number;
    heightIn: number;
    weightLbs: number;
}

export interface Limit {
    min: number;
    max: number;
}

/** Inclusive bounds for each field; the metric bounds are the imperial ones converted and rounded. */
export const BMI_LIMITS: Readonly<{
    weightKg: Limit;
    heightCm: Limit;
    weightLbs: Limit;
    heightFt: Limit;
    heightIn: Limit;
    totalHeightIn: Limit;
}> = {
    weightKg: { min: 24.947, max: 453.592 },
    heightCm: { min: 91.44, max: 274.32 },
    weightLbs: { min: 55, max: 1000 },
    heightFt: { min: 3, max: 9 },
    heightIn: { min: 0, max: 11 },
    // Feet and inches pass on their own yet can still add up past 9 ft 0 in.
    totalHeightIn: { min: 36, max: 108 },
};

const BMI_QUESTION_ID = 'bmiControl';

/** Body mass index rounded to two decimals, or `null` when the measure gives no meaningful value. */
export function bmi(measure: MetricMeasure | ImperialMeasure): number | null {
    const height = measure.system === 'metric' ? measure.heightCm / 100 : measure.heightFt * 12 + measure.heightIn;
    // 703 turns pounds per square inch into kilograms per square metre.
    const weight = measure.system === 'metric' ? measure.weightKg : measure.weightLbs * 703;
    const result = weight / (height * height);

    return Number.isFinite(result) && result > 0 ? Number(result.toFixed(2)) : null;
}

/** The BMI answer closest to the given index; `null` for an index `bmi` could not give. */
export function nearestBmiOption(value: number | null, algorithm: Algorithm = ALGORITHM): string | null {
    if (value === null || !Number.isFinite(value) || value <= 0) {
        return null;
    }

    const question = algorithm.questions.find(item => item.id === BMI_QUESTION_ID);
    let nearest: string | null = null;
    let distance = Infinity;
    for (const { id } of question?.options ?? []) {
        // Open-ended answers need a representative value next to their boundary to stay comparable.
        const optionValue = id.startsWith('<') ? parseFloat(id.slice(1)) - 1
            : id.endsWith('>') ? parseFloat(id.slice(0, -1)) + 1 : parseFloat(id);
        const difference = Math.abs(value - optionValue);
        if (difference < distance) {
            distance = difference;
            nearest = id;
        }
    }

    return nearest;
}
