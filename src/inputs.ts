const OWN_EXPECTANCY_LIMITS = { min: 1, max: 120 } as const;

export type OwnExpectancyProblem = 'not-a-number' | 'below-min' | 'above-max';

export function checkOwnExpectancy(value: number): OwnExpectancyProblem | null {
    if (Number.isNaN(value)) {
        return 'not-a-number';
    }
    if (value < OWN_EXPECTANCY_LIMITS.min) {
        return 'below-min';
    }
    if (value > OWN_EXPECTANCY_LIMITS.max) {
        return 'above-max';
    }

    return null;
}

/** Compares local calendar days, so a birth earlier today still counts as today. */
export function checkBirthDate(birthDate: Date, now: Date): 'not-in-past' | null {
    const birthDay = new Date(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return birthDay >= today ? 'not-in-past' : null;
}
