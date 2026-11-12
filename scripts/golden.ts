// Rewrites golden/results.json from golden/profiles.json. A change that shifts any estimate shows up as a
// diff of that file, which is how a reviewer sees what the change does to real profiles.
//
//   npm run golden
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { goldenResults, GoldenProfiles } from './golden-results';

const goldenDir = fileURLToPath(new URL('../golden/', import.meta.url));
const profiles = JSON.parse(readFileSync(`${goldenDir}profiles.json`, 'utf8')) as GoldenProfiles;

writeFileSync(`${goldenDir}results.json`, JSON.stringify(goldenResults(profiles), null, 2) + '\n');
