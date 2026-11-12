# Contributing

Anyone can propose a change to anything here, the formula included. Most of the useful work is not code at all.
It is a better-grounded weight, a factor the method misses, fresher figures for a country, or a sentence that
reads more clearly. Start with an issue and pick the template that fits:

- **Weight change** — an option's weight should be different.
- **New factor** — a question or an option the method does not have.
- **Country data** — figures or a name in the country table.
- **Wording** — a question, an option, a description or a source reads badly or is wrong.

Anything else can be a plain issue. If you are comfortable with git, a pull request is welcome too; the
sections below say what it needs.

## Evidence for a change that moves the estimate

A change to a weight, a new factor or a change to the formula moves real people's results, so it rests on
evidence of the same strength as the sources already in `data/algorithm.json`.

- **The source is a systematic review, a meta-analysis or a large prospective cohort study**, linked by its
  PubMed or DOI address. A single small study, a news article or a blog post is not enough on its own, though it
  can be a good reason to open an issue and look for stronger evidence together.
- **The source goes into the same pull request**, added to the question's `sources`, together with a short
  explanation of how the reported effect turns into the proposed weight.
- **The pull request shows what it does to real profiles.** Run `npm run golden` and commit the updated
  `golden/results.json`; its diff is how a reviewer sees which estimates move and by how much. CI fails when the
  file does not match what the code computes.

A new factor meets the same bar as a new weight.

## Country data

`data/countries.json` is generated, so it is never edited by hand. A new edition of World Population Prospects
means a new file, a new checksum in `scripts/build-countries.ts` and in the README, and a rebuild with
`npm run build-countries`. A correction to a country's name goes into `data/country-names.json`.

## Ids and versions

Every question and option has an `id` that apps store with a saved answer. Ids are permanent within a major
version, and CI fails a pull request that removes or renames one unless it also raises the major version. The
`label` next to an id is free to improve at any time. BMI option ids are a number, `<number` or `number>`,
because the package matches a measured BMI to them by that number.

Versions follow semantic versioning.

| Change | Version |
| --- | --- |
| Texts, labels and sources that change no number | patch |
| Anything that moves a result, such as a weight, a new question or option, new country data or the formula | minor, with a **Results change** section in the changelog |
| An id removed or renamed, or a change to the shape of the data or the API | major |

## Writing

The texts here are read by people thinking about how much time they have, so they are written with care. A few
rules hold for every question, option, description and document.

1. Write the way you would explain something to a friend, plainly and without hurry.
2. Say what a study shows and stop there. No promises, no exaggeration, no certainty the evidence does not have.
3. Never press. Nothing that hurries, frightens, praises or scolds a person for an answer.
4. Let a thought develop in its own sentence instead of trailing it with a list of examples.
5. Leave out stock phrases, marketing words and templates such as "it's not X, it's Y".
6. Keep labels and options short; give descriptions the room they need to be clear.
7. Use plain English; the package is English-only for now.

Polish is not a condition for proposing anything. The final edit of every text is part of the maintainer's
review, so a rough draft with a good source behind it is a perfectly good start.

## Who decides

The maintainer reviews every proposal and has the last word on what is merged. Changes to the data, the code,
the schemas, the scripts and the golden profiles need the maintainer's approval through `CODEOWNERS`, and nothing
reaches the main branch without a pull request and green CI. More maintainers may join later.

A proposal that is declined still gets an answer explaining why, and it can come back with stronger evidence.

## Working on the code

```bash
npm ci
npm test                         # specs, data schemas and golden profiles
npm run lint
npm run typecheck
npm run build                    # the package as it is published, in dist/
npm run golden                   # rewrite golden/results.json
npm run check-ids -- origin/main # the id check CI runs on a pull request
```

The library code in `src/` stays free of runtime dependencies, the DOM and Node APIs, and it never reads the
clock; the current date is always a parameter. New logic comes with specs next to it.

Everyone taking part agrees to the [Code of Conduct](CODE_OF_CONDUCT.md).
