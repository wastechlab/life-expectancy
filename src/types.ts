/** `null` is "Prefer not to say". */
export type Sex = 'male' | 'female' | null;

/** Question id → option id; `null` while a question is unanswered. */
export type Answers = Record<string, string | null>;

export interface CountryFigures {
    code: string;
    name: string;
    male: number;
    female: number;
    both: number;
}

export interface AlgorithmOption {
    id: string;
    label: string;
    /** Percentage shift of the remaining years; `null` on the option that hands the answer to another question. */
    weight: number | null;
}

export interface AlgorithmOverview {
    title: string;
    body: string;
}

export interface AlgorithmSource {
    title: string;
    url: string;
}

export interface AlgorithmQuestion {
    id: string;
    label: string;
    question: string;
    required: boolean;
    description: string;
    overview: AlgorithmOverview[];
    sources: AlgorithmSource[];
    options: AlgorithmOption[];
}

/** Daily tobacco use is weighed by how many cigarettes, so only one of the two answers counts. */
export interface TobaccoRule {
    questionId: string;
    dailyOptionId: string;
    cigarettesQuestionId: string;
}

export interface Algorithm {
    tobacco: TobaccoRule;
    questions: AlgorithmQuestion[];
}

/** Ages in years; `currentAge` is the age the range was measured from. */
export interface AssessmentRange {
    minAge: number;
    maxAge: number;
    currentAge: number;
}

export type AssessmentIssue = 'base-exhausted' | 'range-not-future';

export type AssessmentResult = { range: AssessmentRange } | { issue: AssessmentIssue };

export interface AssessmentInput {
    birthDate: Date;
    sex: Sex;
    countries: readonly CountryFigures[];
    /** The person's own guess at their life expectancy, in years. */
    ownExpectancy: number;
    answers: Answers;
    now: Date;
}
