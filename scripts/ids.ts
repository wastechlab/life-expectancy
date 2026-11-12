import type { Algorithm } from '../src/types';

const BMI_QUESTION_ID = 'bmiControl';
/** "<25", "28" or "44>": the BMI answer is matched to a measured index by the number in its id. */
const BMI_OPTION_ID = /^(<\d+(\.\d+)?|\d+(\.\d+)?|\d+(\.\d+)?>)$/;

export interface Release {
    algorithm: Algorithm;
    version: string;
}

function major(version: string): number {
    return Number(version.split('.')[0]);
}

/**
 * What stops a change to the algorithm from merging. Saved answers are stored by question and option id, so an id
 * that disappears breaks every answer stored with it: removing or renaming one is a breaking change and needs a
 * new major version. `base` is `null` when there is nothing to compare with yet.
 */
export function idProblems(base: Release | null, head: Release): string[] {
    const problems: string[] = [];

    const bmiQuestion = head.algorithm.questions.find(question => question.id === BMI_QUESTION_ID);
    for (const option of bmiQuestion?.options ?? []) {
        if (!BMI_OPTION_ID.test(option.id)) {
            problems.push(`BMI option id "${option.id}" is not a number, "<number" or "number>"`);
        }
    }

    if (base === null || major(head.version) > major(base.version)) {
        return problems;
    }

    for (const question of base.algorithm.questions) {
        const kept = head.algorithm.questions.find(item => item.id === question.id);
        if (!kept) {
            problems.push(`Question "${question.id}" was removed or renamed without a new major version`);
            continue;
        }
        for (const option of question.options) {
            if (!kept.options.some(item => item.id === option.id)) {
                problems.push(`Option "${option.id}" of "${question.id}" was removed or renamed without a new major version`);
            }
        }
    }

    return problems;
}
