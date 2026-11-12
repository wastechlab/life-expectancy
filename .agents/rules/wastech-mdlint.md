# Markdown documents and wastech-mdlint

These rules cover every Markdown file wastech-mdlint checks in this repository. Which files those are, which rules are on, and every size budget live in `wastech-mdlint.config.json`: read the config rather than relying on a copy here, so this page cannot fall out of step with it. Paths on this page are relative to the repository root.

This page was written by `wastech-mdlint init`, which never overwrites it, and then fitted to this repository.

## Linting

- Run the linter from the repository root, where the config lives: `npx wastech-mdlint lint`. `npx wastech-mdlint lint --fix` applies the deterministic fixes, and `npx wastech-mdlint lint --format json` reports the findings as data, each with its `ruleId`, `severity` and `filePath`.
- **Changed a Markdown file — lint before you finish.** A run fails on `error` findings, not on warnings.
- **An `error` gets fixed, not silenced.** Most often it is a broken link or anchor after a rename or a move: update every link to the file in the same change. Do not add an inline disable or switch the rule off to get a clean run.
- **Before you move, rename or split a file, check its blast radius:** `npx wastech-mdlint impact <file>` lists every document that links to it, directly or through others, with `<file>` relative to the directory you run it from.
- When your host has the wastech-mdlint MCP server configured (`wastech-mdlint-mcp`, read-only), its `lint-files` and `impact-analysis` tools answer the same questions without a shell.

## Size budgets: split, never cut

[`SIZE-001`](https://github.com/VladimirMakarevich/wastech-mdlint/blob/main/docs/guide/rules/SIZE-001.md) budgets each file — bytes, lines and estimated tokens. [`LLM-001`](https://github.com/VladimirMakarevich/wastech-mdlint/blob/main/docs/guide/rules/LLM-001.md) budgets everything an entrypoint such as `CLAUDE.md` pulls in through eager `@` imports, summed. If the config enables neither yet, this section applies from the moment one is added.

- **A budget is never a reason to drop content.** The requested edit, detail, example or clarification goes in, in full. Refusing it, shortening it, squeezing the wording until it fits, or deleting other useful text to make room are all forbidden. The budget limits the file, not the knowledge: the answer to “it does not fit” is a finer-grained structure.
- **Over budget — split the document; do not raise the threshold.** A threshold moves only when a whole class of files grows, and only with the user's agreement.
- **A warning** means the file is close to its budget: say so in your report and propose a split (the table below decides who carries it out); the change itself is not blocked. **An error** means the document is split before the change is finished.

### Who decides on a split

| What is over budget | How it is split |
| --- | --- |
| Public documents: `README.md`, `METHODOLOGY.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, the pull request template | Only after the user confirms your split plan: contributors and other sites link to these files and their headings |
| Agent rules and entrypoints (`.agents/rules/`, `AGENTS.md`, `CLAUDE.md`) | Only after a discussion with the user: the structure of the rules is the user's decision, and your plan is a starting point, not a request for approval |
| Anything not listed above | Ask the user first |

While a split waits for the user, the requested edit is still made in full. The file stays over budget and your report says so honestly — the lint result, why, and the proposed plan. A pending decision never holds the content back.

### The split plan to put to the user

- What triggered it: the file, the rule (`SIZE-001` or `LLM-001`), and the current size against the budget.
- The new files: paths, names, and the one topic each of them covers.
- What stays in the original file, and how it routes the reader to the parts.
- Which inbound links change (from `impact`) and which indexes are updated.

## How to split a document

1. **Split by meaning, not by line count.** Each part is one coherent topic that reads without the others — never a “part 1 / part 2” cut in the middle of a thought.
2. **The original path stays the entry point.** It keeps the essentials and becomes a router: what lives where and when to read it, with a link to each part. Links into it keep working; links to anchors that moved are updated in the same change.
3. **Each part goes next to what it came from.** A skill keeps its trigger `description`, its workflow and its hard constraints in `SKILL.md` and moves the details to supporting files beside it (for example `references/<topic>.md`), each linked with a line on when to read it; an agent or a command does the same. A rule becomes sibling files in its rules directory, registered wherever the rules are listed. `AGENTS.md` and `CLAUDE.md` move details to a file reached by an ordinary link, never by an `@` import, because `LLM-001` counts only what is imported eagerly. A document under `docs/` becomes sibling files, or a folder with an index page.
4. **Nothing is lost or duplicated.** Every statement of the original ends up in exactly one part — moved, not paraphrased away, and not copied into several parts.
5. **Each part lands well under its warning threshold**, so the next edit does not trigger the same split again.
6. **Verify:** `npx wastech-mdlint lint` is clean. Where the config enables them, `REF-001` and `REF-002` catch a broken link or anchor and `GRP-001` catches a new reference cycle.

The `mdlint-docs` agent skill walks through a split step by step. Install it with `gh skill install VladimirMakarevich/wastech-mdlint mdlint-docs --pin v0.2.2`.
