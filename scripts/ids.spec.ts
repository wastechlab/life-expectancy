import { idProblems, Release } from './ids';
import { Algorithm, AlgorithmQuestion } from '../src/types';

const question = (id: string, ...optionIds: string[]): AlgorithmQuestion => ({
    id, label: id, question: id, required: true, description: '', overview: [], sources: [],
    options: optionIds.map(optionId => ({ id: optionId, label: optionId, weight: 0 })),
});
const algorithm = (...questions: AlgorithmQuestion[]): Algorithm => ({
    tobacco: { questionId: 'smokeControl', dailyOptionId: 'Daily', cigarettesQuestionId: 'cigarettesControl' },
    questions,
});
const release = (version: string, ...questions: AlgorithmQuestion[]): Release => ({ version, algorithm: algorithm(...questions) });

describe('idProblems', () => {
    const base = release('1.2.0', question('stressControl', 'Low', 'High'), question('bmiControl', '<25', '25', '44>'));

    it('lets a change through that keeps every id and adds new ones', () => {
        const head = release('1.3.0', question('stressControl', 'Low', 'High', 'Medium'), question('bmiControl', '<25', '25', '44>'),
            question('sunControl', 'Often'));

        expect(idProblems(base, head)).toEqual([]);
    });

    it('stops an option that was removed or renamed without a new major version', () => {
        const head = release('1.3.0', question('stressControl', 'Low', 'Very high'), question('bmiControl', '<25', '25', '44>'));

        expect(idProblems(base, head)).toEqual(['Option "High" of "stressControl" was removed or renamed without a new major version']);
    });

    it('stops a question that was removed without a new major version', () => {
        const head = release('1.2.1', question('bmiControl', '<25', '25', '44>'));

        expect(idProblems(base, head)).toEqual(['Question "stressControl" was removed or renamed without a new major version']);
    });

    it('lets a removal through with a new major version', () => {
        const head = release('2.0.0', question('bmiControl', '<25', '25', '44>'));

        expect(idProblems(base, head)).toEqual([]);
    });

    it('stops a BMI option whose id is not a number with an optional open end', () => {
        const head = release('2.0.0', question('stressControl', 'Low', 'High'), question('bmiControl', '<25', '25.5', '44>', 'obese'));

        expect(idProblems(base, head)).toEqual(['BMI option id "obese" is not a number, "<number" or "number>"']);
    });

    it('checks only the BMI ids when there is no earlier version to compare with', () => {
        const head = release('1.0.0', question('bmiControl', '<25', '>44'));

        expect(idProblems(null, head)).toEqual(['BMI option id ">44" is not a number, "<number" or "number>"']);
    });
});
