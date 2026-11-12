import { assess } from '../src/assessment';
import { findCountry } from '../src/countries';
import { Answers, AssessmentResult, Sex } from '../src/types';

export interface GoldenProfile {
    id: string;
    note: string;
    /** YYYY-MM-DD, read as UTC midnight so the results do not depend on the machine's time zone. */
    birthDate: string;
    sex: Sex;
    countries: string[];
    ownExpectancy: number;
    answers: Answers;
}

export interface GoldenProfiles {
    now: string;
    profiles: GoldenProfile[];
}

export function goldenResults(golden: GoldenProfiles): Record<string, AssessmentResult> {
    const now = new Date(golden.now);
    const results: Record<string, AssessmentResult> = {};
    for (const profile of golden.profiles) {
        results[profile.id] = assess({
            birthDate: new Date(`${profile.birthDate}T00:00:00.000Z`),
            sex: profile.sex,
            countries: profile.countries.map(code => {
                const country = findCountry(code);
                if (!country) {
                    throw new Error(`Golden profile ${profile.id}: no country ${code} in the table`);
                }
                return country;
            }),
            ownExpectancy: profile.ownExpectancy,
            answers: profile.answers,
            now,
        });
    }

    return results;
}
