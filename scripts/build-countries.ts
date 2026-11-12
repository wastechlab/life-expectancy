// Rewrites data/countries.json from the UN World Population Prospects 2024 "Demographic Indicators" file,
// medium variant, exactly as published (gzip-compressed CSV). The file is too large to commit; its checksum
// pins the one edition the table is built from, so anyone can rebuild the same bytes and a different file is
// refused rather than silently shifting every estimate.
//
//   npm run build-countries -- <path to WPP2024_Demographic_Indicators_Medium.csv.gz>
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { countriesTable } from './countries-table';

const WPP_SHA256 = '286ac36bb1415e2e1ade03acfef0a29f0e4c087e2f78e38c48f50c5df89082bc';

const source = process.argv[2];
if (!source) {
    throw new Error('Pass the path to WPP2024_Demographic_Indicators_Medium.csv.gz');
}

const file = readFileSync(source);
const sha256 = createHash('sha256').update(file).digest('hex');
if (sha256 !== WPP_SHA256) {
    throw new Error(`${source} has SHA-256 ${sha256}; the table is built from the file with SHA-256 ${WPP_SHA256}`);
}

const dataDir = fileURLToPath(new URL('../data/', import.meta.url));
const names = JSON.parse(readFileSync(`${dataDir}country-names.json`, 'utf8')) as Record<string, string>;
const table = countriesTable(gunzipSync(file).toString('utf8'), names);

writeFileSync(`${dataDir}countries.json`, JSON.stringify(table, null, 2) + '\n');
