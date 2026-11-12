import { countryAverage, findCountry } from './countries';
import { CountryFigures } from './types';

const first: CountryFigures = { code: 'AA', name: 'First', male: 70, female: 80, both: 76 };
const second: CountryFigures = { code: 'BB', name: 'Second', male: 60, female: 64, both: 61 };

describe('countryAverage', () => {
    it('takes the figure for the given sex', () => {
        expect(countryAverage([first], 'male')).toBe(70);
        expect(countryAverage([first], 'female')).toBe(80);
    });

    it('takes the mean of male and female, not the both figure, when sex is not given', () => {
        expect(countryAverage([first], null)).toBe(75);
    });

    it('averages several countries', () => {
        expect(countryAverage([first, second], 'male')).toBe(65);
        expect(countryAverage([first, second], null)).toBe((75 + 62) / 2);
    });

    it('has no value without a country', () => {
        expect(countryAverage([], 'female')).toBeNull();
    });
});

describe('findCountry', () => {
    it('finds a country by its code in any case', () => {
        expect(findCountry('jp')?.code).toBe('JP');
    });

    it('finds nothing for an unknown code', () => {
        expect(findCountry('XX')).toBe(undefined);
    });
});
