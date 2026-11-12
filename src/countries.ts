import { COUNTRIES } from './data.js';
import { CountryFigures, Sex } from './types.js';

export function findCountry(code: string): CountryFigures | undefined {
    const wanted = code.toUpperCase();
    return COUNTRIES.find(country => country.code === wanted);
}

/** Mean life expectancy across the chosen countries for the given sex; `null` when none is chosen. */
export function countryAverage(countries: readonly CountryFigures[], sex: Sex): number | null {
    let sum = 0;
    for (const country of countries) {
        // With sex not given, the mean of the same male and female figures keeps the value consistent with
        // either disclosed answer, which the separately sourced "both" figure does not guarantee.
        sum += sex === null ? (country.male + country.female) / 2 : country[sex];
    }

    return countries.length > 0 ? sum / countries.length : null;
}
