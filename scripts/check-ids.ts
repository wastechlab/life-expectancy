// Compares the question and option ids in data/algorithm.json with the same file at a base git ref (the target
// branch of a pull request) and fails when an id is gone without a new major version, or a BMI option id has
// the wrong shape.
//
//   npm run check-ids -- origin/main
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { idProblems, type Release } from './ids';

const root = fileURLToPath(new URL('..', import.meta.url));
const baseRef = process.argv[2];

function readRelease(read: (path: string) => string): Release {
    return {
        algorithm: JSON.parse(read('data/algorithm.json')),
        version: JSON.parse(read('package.json')).version,
    };
}

function baseRelease(): Release | null {
    if (!baseRef) {
        return null;
    }
    // A ref that does not resolve is a broken setup, such as a shallow checkout, and must not pass as "no base".
    execFileSync('git', ['rev-parse', '--verify', '--quiet', `${baseRef}^{commit}`], { cwd: root, stdio: 'ignore' });
    try {
        return readRelease(path => execFileSync('git', ['show', `${baseRef}:${path}`], { cwd: root, encoding: 'utf8' }));
    } catch {
        // The base predates the algorithm file, as on the very first pull request; there is nothing to keep.
        console.log(`No data/algorithm.json at ${baseRef}; only the BMI ids are checked.`);
        return null;
    }
}

const problems = idProblems(baseRelease(), readRelease(path => readFileSync(`${root}${path}`, 'utf8')));
for (const problem of problems) {
    console.error(problem);
}
process.exitCode = problems.length > 0 ? 1 : 0;
