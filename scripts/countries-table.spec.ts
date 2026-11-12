import { countriesTable } from './countries-table';

const HEADER = 'SortOrder,LocID,Notes,ISO3_code,ISO2_code,Location,Time,LEx,LExMale,LExFemale';
const csv = (...rows: string[]): string => [HEADER, ...rows].join('\r\n') + '\r\n';
const NAMES = { HK: 'Hong Kong', PT: 'Portugal', JP: 'Japan' };

describe('countriesTable', () => {
    it('takes male, female and both from LExMale, LExFemale and LEx of the estimate year, to hundredths', () => {
        const table = countriesTable(csv(
            '1,620,,PRT,PT,Portugal,2022,81.9,78.9,84.6',
            '2,620,,PRT,PT,Portugal,2023,82.3599,79.4371,85.1185',
            '3,620,,PRT,PT,Portugal,2024,82.5,79.6,85.3',
        ), NAMES);

        expect(table).toEqual([{ code: 'PT', name: 'Portugal', male: 79.44, female: 85.12, both: 82.36 }]);
    });

    it('rounds a half up, as the decimal digits read', () => {
        const [portugal] = countriesTable(csv('1,620,,PRT,PT,Portugal,2023,1.005,76.975,80'), NAMES);

        expect([portugal.both, portugal.male, portugal.female]).toEqual([1.01, 76.98, 80]);
    });

    it('leaves out regions and groups, which have no ISO2 code', () => {
        const table = countriesTable(csv(
            '1,5507,,,,ADB region: Central and West Asia,2023,70.1,68,72.3',
            '2,900,,,,World,2023,73.2,70.8,75.7',
            '3,620,,PRT,PT,Portugal,2023,82.3599,79.4371,85.1185',
        ), NAMES);

        expect(table.map(country => country.code)).toEqual(['PT']);
    });

    it('reads quoted location names with commas without shifting the columns', () => {
        const [hongKong] = countriesTable(csv('1,344,6,HKG,HK,"China, Hong Kong SAR",2023,85.5106,82.8444,88.1294'), NAMES);

        expect(hongKong).toEqual({ code: 'HK', name: 'Hong Kong', male: 82.84, female: 88.13, both: 85.51 });
    });

    it('names each country from the package names, not from the WPP location', () => {
        const [portugal] = countriesTable(csv('1,620,,PRT,PT,Republic of Portugal,2023,82.3599,79.4371,85.1185'), NAMES);

        expect(portugal.name).toBe('Portugal');
    });

    it('orders the table by code, whatever the order of the file', () => {
        const table = countriesTable(csv(
            '1,620,,PRT,PT,Portugal,2023,82.3599,79.4371,85.1185',
            '2,392,,JPN,JP,Japan,2023,84.7123,81.6877,87.7411',
            '3,344,6,HKG,HK,"China, Hong Kong SAR",2023,85.5106,82.8444,88.1294',
        ), NAMES);

        expect(table.map(country => country.code)).toEqual(['HK', 'JP', 'PT']);
    });

    it('reads a file that starts with a byte order mark', () => {
        const table = countriesTable('\uFEFF' + csv('1,620,,PRT,PT,Portugal,2023,82.3599,79.4371,85.1185'), NAMES);

        expect(table.length).toBe(1);
    });

    it('refuses a file without one of the columns it reads', () => {
        expect(() => countriesTable('ISO2_code,Time,LEx,LExMale\r\nPT,2023,82.3599,79.4371\r\n', NAMES))
            .toThrowError(/LExFemale/);
    });

    it('refuses a country the package has no name for', () => {
        expect(() => countriesTable(csv('1,250,,FRA,FR,France,2023,83.3,80.3,86.1'), NAMES)).toThrowError(/FR/);
    });
});
