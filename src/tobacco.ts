import { ALGORITHM } from './data.js';
import { Algorithm } from './types.js';

/** Whether the cigarettes question takes over from the tobacco question for this tobacco answer. */
export function cigarettesActive(tobaccoAnswer: string | null, algorithm: Algorithm = ALGORITHM): boolean {
    return tobaccoAnswer !== null && tobaccoAnswer === algorithm.tobacco.dailyOptionId;
}
