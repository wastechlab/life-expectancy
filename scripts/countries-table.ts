import { CountryFigures } from '../src/types';

/** The estimate, not a projection: the latest year World Population Prospects 2024 reports as observed. */
const ESTIMATE_YEAR = '2023';

/**
 * WPP's four decimals claim more precision than an estimate of a lifetime has; hundredths are as fine as a person
 * reads such a figure. The exponent moves the decimal point in the text itself: through a binary float, 76.975
 * would round down to 76.97.
 */
function hundredths(value: string): number {
    return Math.round(Number(`${value}e2`)) / 100;
}

/** Splits one CSV record; location names such as "China, Hong Kong SAR" arrive quoted because of their commas. */
function csvFields(line: string): string[] {
    const fields: string[] = [];
    let field = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (quoted && char === '"' && line[i + 1] === '"') {
            field += '"';
            i++;
        } else if (char === '"') {
            quoted = !quoted;
        } else if (char === ',' && !quoted) {
            fields.push(field);
            field = '';
        } else {
            field += char;
        }
    }
    fields.push(field);

    return fields;
}

/**
 * The country table from the WPP "Demographic Indicators" CSV: every country or area with an ISO2 code, its
 * life expectancy at birth in the estimate year to hundredths, and the name the package gives that code. Sorted by code, so
 * rebuilding from the same file gives the same bytes and an update to one country is a one-row diff.
 */
export function countriesTable(csv: string, names: Readonly<Record<string, string>>): CountryFigures[] {
    const [headerLine, ...lines] = csv.replace(/^\uFEFF/, '').split(/\r?\n/);
    const header = csvFields(headerLine);
    const column = (name: string): number => {
        const index = header.indexOf(name);
        if (index < 0) {
            throw new Error(`The CSV has no ${name} column`);
        }
        return index;
    };
    const code = column('ISO2_code');
    const year = column('Time');
    const both = column('LEx');
    const male = column('LExMale');
    const female = column('LExFemale');

    const table: CountryFigures[] = [];
    for (const line of lines) {
        const row = csvFields(line);
        if (row[year] !== ESTIMATE_YEAR || !row[code]) {
            continue;
        }

        const name = names[row[code]];
        if (!name) {
            throw new Error(`country-names.json has no name for ${row[code]}`);
        }
        table.push({ code: row[code], name, male: hundredths(row[male]), female: hundredths(row[female]), both: hundredths(row[both]) });
    }

    // Plain code-point order: a locale-aware sort could differ between the machines that rebuild the file.
    return table.sort((a, b) => (a.code < b.code ? -1 : 1));
}
