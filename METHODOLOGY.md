# Methodology

This page describes how the package turns a few facts about a person and ten answers into a range of ages,
where every number in the formula comes from, and what the method cannot tell you. The code that does it is
`src/assessment.ts`; the questions, options and weights live in `data/algorithm.json`.

The estimate is meant for reflection. It is a rough, transparent calculation built from published averages and
broad answers, and it says nothing certain about any one person's life.

## What goes in

- **Date of birth** and the current date, which give the person's age in years of 365.25 days.
- **Sex**, or no answer to it.
- **One or more countries.** Each has a life expectancy at birth for men, for women and for both together
  (`data/countries.json`).
- **The person's own expectancy**, a number of years from 1 to 120 they would guess for themselves.
- **Answers** to ten questions: outlook on aging, BMI, stress, sleep, tobacco use, cigarettes a day, exercise,
  air quality, alcohol and diet. Each option carries a weight, a percentage that moves the estimate up or down.

## How the range is calculated

### 1. The base

For a person aged 80 or younger the base is the plain average of three numbers.

```text
base = (country average + 85 + own expectancy) / 3
```

The country average is the mean of the chosen countries' figures for the person's sex. When sex is not given,
each country counts as the mean of its male and female figures rather than its "both" figure, so the result sits
between the two disclosed answers. With no country chosen, the country part counts as zero.

For a person older than 80 the base is their age plus five years, and countries and the own expectancy are not
used.

### 2. Years left

```text
years left = base − age
```

When the base is not above the current age there is nothing left to adjust, and the package reports
`base-exhausted` instead of a range.

### 3. How strongly the answers count

The fewer years the base leaves, the more fully each answer counts. A young person with most of a lifetime
ahead gets a damped effect, so that a handful of answers does not swing the estimate by decades.

| Years left at the base | Share of each weight that counts |
| --- | --- |
| more than 95 | 60% |
| more than 90 | 65% |
| more than 85 | 75% |
| more than 80 | 85% |
| 80 or fewer | 100% |

### 4. Applying the answers

Answers are applied one at a time, and each one changes the years left by a percentage.

```text
percentage = weight × share / base
years left = years left × (1 + percentage / 100)
```

Because each step works on the result of the previous one, the effects compound. An unanswered question changes
nothing, and neither does an option id the algorithm does not know.

Tobacco is applied last and only once. If the answer to "Tobacco use" is "Daily", the answer to "Cigarettes a
day" counts and the tobacco answer does not; otherwise the tobacco answer counts and any cigarettes answer is
ignored. The two questions describe the same habit, and counting both would weigh it twice.

### 5. The range

```text
estimate = age + years left
range    = estimate − 2.5% … estimate + 2.5%
```

When the lower end of the range is not after the current date, the package reports `range-not-future` instead.

### A worked example

A woman aged 36.4 chooses Portugal, whose figure for women is 85.12, and guesses 85 for herself.

- The base is (85.12 + 85 + 85) / 3 = 85.04, which leaves 48.63 years, so every weight counts in full.
- She answers "Very Low" to the stress question, which weighs +4. That is 4 × 100 / 85.04 = 4.70%, and the years
  left grow to 50.92.
- With every other question left neutral the estimate is 87.33, and the range runs from 85.14 to 89.51.

`golden/profiles.json` holds a fixed set of such people, one for each branch of the formula, and
`golden/results.json` holds what the package gives them. A change that moves any of these numbers shows up in
the diff of that file.

## Where the numbers come from

### The country table

`data/countries.json` comes from the United Nations World Population Prospects 2024, the "Demographic
Indicators" file of the medium variant. It takes life expectancy at birth (`LEx`, `LExMale`, `LExFemale`) for
2023, the latest year the edition reports as an estimate rather than a projection, for every country or area
with an ISO 3166-1 alpha-2 code, plus XK for Kosovo. The values are rounded to hundredths. Country names do not
come from WPP; they are short English names kept in `data/country-names.json`.

`npm run build-countries` rebuilds the table from the published file and refuses any other file by its checksum.
The README names the file, its address and the checksum.

### The weights

Each question in `data/algorithm.json` lists the meta-analyses, cohort studies and WHO fact sheets it rests on.
A weight is a judgment of the direction and rough size of the effect those sources report. The weights
were not computed from the studies' hazard ratios by a stated formula, and doing that properly is one of the
most useful things a contributor could bring.

### The constants of the formula

Four constants carry the formula, and none of them comes from a published source. They are the author's
heuristics. What each one does is described below, and each is open to change on the same terms as everything
else in this package ([CONTRIBUTING.md](CONTRIBUTING.md)).

- **85 years**, the third part of the base. In effect it pulls the base toward the higher national figures and
  limits how far one country or one guess can move it.
- **±2.5%** for the range. It marks the result as an estimate rather than a date, and it is not a statistical
  confidence interval.
- **"Older than 80 means age plus 5 years."** Past 80 a base built from at-birth figures would often fall below
  the person's age, and five more years keep the estimate in the future.
- **The 60, 65, 75, 85 and 100% shares** by years left. They damp the answers for people with most of their life
  ahead, where the same weight applied to many decades would move the estimate much further.

## What the method cannot tell you

- **Life expectancy at birth is not the years left at your age.** Someone who is 60 has already lived through the
  risks of the years before, so the age they can expect to reach is higher than the at-birth figure for their
  country. The base mixes at-birth figures with the person's age, so for older people it runs low; the "older
  than 80" rule only papers over the far end of this.
- **The country figures are period estimates for 2023.** They describe mortality in that year, not the
  improvements a person born today may live to see.
- **The three parts of the base weigh the same.** There is no evidence that a country average, a fixed 85 and a
  personal guess deserve equal shares.
- **The answers are broad, self-reported categories**, and the weights treat them as independent. In reality
  they overlap and interact; exercise, BMI and sleep are not separate forces.
- **The range is not a probability.** A result outside it is not unusual.
- **With no country chosen, the base loses a third of its usual size.** The country part counts as zero rather
  than being left out.

Proposals that address any of these are welcome. [CONTRIBUTING.md](CONTRIBUTING.md) explains what evidence a
change needs and how it is reviewed.
