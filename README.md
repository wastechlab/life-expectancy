# Life expectancy calculator

The method behind the life expectancy estimate in [Wastime](https://wastime.app), published so that anyone can
read it, check it and propose something better. It has three parts.

- **The algorithm.** Ten questions about outlook, BMI, stress, sleep, tobacco, exercise, air, alcohol and diet,
  each option with a weight and each question with the studies it rests on (`data/algorithm.json`).
- **A country table.** Life expectancy at birth for 237 countries and areas, from UN World Population Prospects
  2024 (`data/countries.json`).
- **The calculation.** Pure TypeScript functions with no runtime dependencies, no framework, no DOM and no Node
  APIs, so the same code runs in an app, in a browser and during server-side rendering.

How the numbers are combined, where each constant comes from and what the method cannot tell you is in
[METHODOLOGY.md](METHODOLOGY.md).

The estimate is a starting point for thinking about the time ahead. It knows nothing of anyone's health history,
and it is not a basis for medical decisions.

## Install

```bash
npm install @wastechlab/life-expectancy
```

## Use

```ts
import { assess, findCountry, futureDates } from '@wastechlab/life-expectancy';

const now = new Date();
const result = assess({
    birthDate: new Date(1990, 5, 15),
    sex: 'female', // 'male', 'female' or null when not given
    countries: [findCountry('PT')!],
    ownExpectancy: 85,
    answers: { stressControl: 'Low', sleepControl: 'Good' }, // question id → option id
    now,
});

if ('range' in result) {
    const { minAge, maxAge } = result.range;
    const dates = futureDates(result.range, now); // the two moments the range points at
} else {
    result.issue; // 'base-exhausted' or 'range-not-future'
}
```

The current date is always a parameter, so the same input gives the same result anywhere. The package returns
codes, never messages; the words a person sees are up to the app or site that shows them.

| Export | What it does |
| --- | --- |
| `assess(input, algorithm?)` | The range of ages, or the reason there is none |
| `futureDates(range, now)` | The dates the range points at, or `null` when part of it is not in the future |
| `ageAt(birthDate, now)` | Age in years of 365.25 days |
| `ALGORITHM` | Questions, options, weights, sources and the tobacco rule |
| `COUNTRIES`, `findCountry(code)` | The country table and a lookup by ISO code |
| `countryAverage(countries, sex)` | The country part of the base |
| `cigarettesActive(tobaccoAnswer)` | Whether "Cigarettes a day" counts instead of "Tobacco use" |
| `bmi(measure)`, `nearestBmiOption(bmi)`, `BMI_LIMITS` | BMI in metric or imperial units, the matching answer, and the accepted ranges |
| `checkOwnExpectancy(value)`, `checkBirthDate(birthDate, now)` | Input checks that return a problem code or `null` |

Question and option ids never change within a major version. They are what an app stores with a saved answer,
so an id that stays put keeps old answers working; the `label` beside it is free to improve.

## Data source

The country table is built from the United Nations, Department of Economic and Social Affairs, Population
Division, *World Population Prospects 2024*: the "Demographic Indicators" file of the medium variant,
`WPP2024_Demographic_Indicators_Medium.csv.gz`, as published at
<https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/CSV_FILES/WPP2024_Demographic_Indicators_Medium.csv.gz>.

| | |
| --- | --- |
| SHA-256 | `286ac36bb1415e2e1ade03acfef0a29f0e4c087e2f78e38c48f50c5df89082bc` |
| Year | 2023, the latest estimate in this edition |
| Columns | `LEx`, `LExMale`, `LExFemale`, rounded to hundredths |
| License | CC BY 3.0 IGO |

The source file is too large to keep in the repository. To rebuild the table, download it and run

```bash
npm run build-countries -- path/to/WPP2024_Demographic_Indicators_Medium.csv.gz
```

The script refuses a file with any other checksum, and two runs on the same file write the same bytes. Country
names are not taken from WPP; they are short English names kept in `data/country-names.json`.

## Contributing

You do not need to write code to propose a change. A new weight, a new factor, fresher data for a country or a
clearer sentence can each start as an issue from a template. [CONTRIBUTING.md](CONTRIBUTING.md) explains what
evidence a change needs, how its effect on real profiles is shown, and who decides. Everyone taking part agrees to
the [Code of Conduct](CODE_OF_CONDUCT.md).

```bash
npm ci
npm test          # specs, including the data schemas and the golden profiles
npm run lint
npm run typecheck
npm run golden    # rewrite golden/results.json after a change that moves the estimate
```

## Licenses

- **Code** — MIT, see [LICENSE](LICENSE).
- **Texts and weights** of the algorithm and the documentation — CC BY 4.0.
- **The country table** — adapted from UN World Population Prospects 2024, CC BY 3.0 IGO.

[LICENSE-DATA](LICENSE-DATA) has the attribution and the list of changes made to the UN data.

## Where it is used

The [Wastime](https://wastime.app) app for iOS and Android and the life expectancy calculator on wastime.app
compute their estimate with this package.
