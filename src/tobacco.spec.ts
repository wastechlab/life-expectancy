import { cigarettesActive } from './tobacco';

describe('cigarettesActive', () => {
    for (const [answer, active] of [
        ['Rarely or never', false],
        ['Sometimes', false],
        ['Not daily, but often', false],
        ['Daily', true],
        [null, false],
    ] as const) {
        it(`is ${active} for ${answer}`, () => {
            expect(cigarettesActive(answer)).toBe(active);
        });
    }
});
