import profiles from '../golden/profiles.json';
import results from '../golden/results.json';
import { goldenResults, GoldenProfiles } from './golden-results';
import { AssessmentResult } from '../src/types';

const golden = profiles as GoldenProfiles;
const expected = results as Record<string, AssessmentResult>;

describe('golden profiles', () => {
    const actual = goldenResults(golden);

    it('cover exactly the recorded results', () => {
        expect(Object.keys(actual)).toEqual(Object.keys(expected));
    });

    for (const profile of golden.profiles) {
        it(`${profile.id} matches the recorded result`, () => {
            const result = actual[profile.id];
            const recorded = expected[profile.id];
            if ('issue' in recorded) {
                expect(result).toEqual(recorded);
                return;
            }

            expect('range' in result).toBe(true);
            if ('range' in result) {
                expect(result.range.minAge).toBeCloseTo(recorded.range.minAge, 9);
                expect(result.range.maxAge).toBeCloseTo(recorded.range.maxAge, 9);
                expect(result.range.currentAge).toBeCloseTo(recorded.range.currentAge, 9);
            }
        });
    }

    it('give the same results on a second run', () => {
        expect(goldenResults(golden)).toEqual(actual);
    });
});
