# Course release record

Status: **ready**

## Release target

- Intended audience: students in Machine Learning and Big Data Analytics.
- Target: https://aiml-sdu.github.io/ml-big-data-learning/
- Release date: 2026-09-06.
- Owner and support route: aiml-sdu repository maintainers.
- Assessment relationship: formative, browser-local practice; no grades are reported.

## Content approval

- The instructor explicitly requested deployment of the reviewed local preview on 2026-09-06.
- All nine challenge rounds, answers, formulas, and source interpretations are approved for this release.
- Representative learner observation was not run; no effectiveness claim is made.

## Content coverage

- Unassigned items: 0.
- Reviewed items: 35.
- Excluded items: 1 supporting context item, omitted when the instructor authorized deployment of the current preview on 2026-09-06.
- Original source locators remain in authoring records and are removed from student-facing pages as requested.

## Rights and privacy

- Original PDFs, notebooks, datasets, logos, and slide assets are excluded from Git and `dist/`.
- Published visuals are generated in code from fixed synthetic teaching data; fonts are system fonts.
- No student data, credentials, unpublished assessment, login, analytics, or synchronized progress is present.
- The interface states that progress and XP stay in the learner's browser and do not represent a grade.

## Learner experience evidence

- Three lecture routes and nine challenge rounds use the approved white, blue, tactile visual direction.
- Playwright passed on desktop and mobile Chromium, with explicit 390 px and 320 px reflow checks.
- Navigation, correct and incorrect feedback, retry, reset, reload, revisit, local persistence, and non-duplicated XP passed.
- Automated WCAG A and AA axe scans passed for the home page and all lectures.
- Controls are keyboard-operable; plots include accessible text; reduced-motion rules and non-colour labels are present.
- Representative learner observation was not run, so this is an instructor-reviewed course companion rather than a validated learning-effectiveness claim.

## Engineering evidence

- `npm run ci`: passed locally on 2026-09-06 with 30 unit/component tests, 10 desktop/mobile browser tests, 6 release-guard tests, and 4 coverage tests.
- Production TypeScript and Vite build passed.
- The built bundle contains HTML, CSS, JavaScript, and the favicon only.
- Dependency audit reported zero known vulnerabilities during clean installation.
- The remote GitHub Actions result will be verified after the source push.

## Deployment and rollback

- Deployment method: manual GitHub Pages workflow from the `main` branch.
- Deployment authorization: explicit instructor request on 2026-09-06.
- Rollback: rerun the Pages workflow from previous `main` revision `ed5002a` if this release fails after publication.
- Storage namespace is `sdu-ml-big-data-2026`; deployment does not migrate or synchronize browser-local state.

## Open blockers

- None.

## Decision log

- 2026-09-06: instructor approved deploying the current three-lecture preview to `aiml-sdu/ml-big-data-learning`.
- 2026-09-06: original source files and lab datasets remain unpublished; the production site uses synthetic teaching data and local-only progress.
