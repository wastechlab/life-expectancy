import Ajv from 'ajv';
import algorithm from '../data/algorithm.json';
import countries from '../data/countries.json';
import countryNames from '../data/country-names.json';
import algorithmSchema from '../schema/algorithm.schema.json';
import countriesSchema from '../schema/countries.schema.json';
import countryNamesSchema from '../schema/country-names.schema.json';

// The weight of the option that hands over to the cigarettes question is null, so a weight is number or null.
const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });

function schemaErrors(schema: object, data: unknown): string[] {
    const validate = ajv.compile(schema);
    return validate(data) ? [] : (validate.errors ?? []).map(error => `${error.instancePath} ${error.message}`);
}

function duplicates(values: string[]): string[] {
    return values.filter((value, index) => values.indexOf(value) !== index);
}

describe('package data', () => {
    for (const [name, schema, data] of [
        ['algorithm.json', algorithmSchema, algorithm],
        ['countries.json', countriesSchema, countries],
        ['country-names.json', countryNamesSchema, countryNames],
    ] as const) {
        it(`${name} matches its schema`, () => {
            expect(schemaErrors(schema, data)).toEqual([]);
        });
    }

    // A schema cannot express uniqueness by one field, and saved answers are looked up by these ids.
    it('gives every question and every option within a question its own id', () => {
        expect(duplicates(algorithm.questions.map(question => question.id))).toEqual([]);
        for (const question of algorithm.questions) {
            expect(duplicates(question.options.map(option => option.id))).toEqual([]);
        }
    });

    it('points the tobacco rule at questions and an option that exist', () => {
        const { questionId, dailyOptionId, cigarettesQuestionId } = algorithm.tobacco;
        const tobacco = algorithm.questions.find(question => question.id === questionId);

        expect(tobacco?.options.some(option => option.id === dailyOptionId)).toBe(true);
        expect(algorithm.questions.some(question => question.id === cigarettesQuestionId)).toBe(true);
    });

    it('lists every country once under the name country-names.json gives its code', () => {
        const names: Record<string, string> = countryNames;

        expect(duplicates(countries.map(country => country.code))).toEqual([]);
        expect(countries.filter(country => country.name !== names[country.code])).toEqual([]);
    });

    it('names countries the short way people call them', () => {
        const nameOf = (code: string) => countries.find(country => country.code === code)?.name;

        expect(['RU', 'IR', 'CN', 'TW', 'CZ', 'PS'].map(nameOf))
            .toEqual(['Russia', 'Iran', 'China', 'Taiwan', 'Czechia', 'Palestine']);
        expect(countries.filter(country => /[(),]/.test(country.name)).map(country => country.name)).toEqual([]);
    });
});
