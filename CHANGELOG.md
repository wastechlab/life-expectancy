# Changelog

Every version that moves a result has a **Results change** section, which says what moved, for whom and by
roughly how much. Apps that use the package repeat it in their own release notes, so people know why an estimate
they saw before has changed.

## 1.0.0

The first public release.

- The algorithm. Ten questions with their options, weights and sources, and the rule that hands daily tobacco
  use over to the cigarettes question.
- The country table. Life expectancy at birth for 237 countries and areas, from the 2023 estimates of UN World
  Population Prospects 2024, rounded to hundredths, with `npm run build-countries` to rebuild it from the
  published file.
- The calculation. `assess`, `futureDates`, `ageAt`, `findCountry`, `countryAverage`, `cigarettesActive`, `bmi`,
  `nearestBmiOption`, `BMI_LIMITS`, `checkOwnExpectancy` and `checkBirthDate`.
- Golden profiles, one for each branch of the formula, with their results.
