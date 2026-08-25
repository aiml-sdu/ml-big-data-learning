# Machine Learning and Big Data Analytics

An interactive, intuition-first course companion for master's students at the University of Southern Denmark.

The current pilot turns the first two lectures into six learning stops. Students classify learning signals, explore how workload pressure changes system architecture, diagnose data-quality problems, compare scaling methods, manipulate a PCA projection, and finish each lecture with formative practice.

## Run locally

Requirements: Node.js 22.12 or newer.

~~~
npm ci
npm run dev
~~~

Open the URL printed by Vite. Progress is stored only in the current browser.

For a production check:

~~~
npm run build
npm run test:e2e
~~~

## Current learning path

1. Choose the learning signal
2. When data changes the architecture
3. Lecture 1 field check
4. Diagnose before you transform
5. Compress a feature space
6. Lecture 2 pipeline check

The complete 2026 lecture inventory is mapped in course/COURSE_PLAN.md; later lectures are intentionally not implemented yet.

## Source material and public safety

Original PPTX files are local authoring sources and are ignored by Git. The public modules contain newly written explanations, interactions, and source locators rather than redistributed lecture decks.

Do not add student data, unpublished assessments, credentials, or copyrighted material without permission. The app has no login, analytics, backend, grade book, or synchronized progress.

## Project structure

- course/: durable teaching decisions, the course plan, module briefs, and release evidence
- materials/: local source notes and ignored slide decks
- src/course/modules/: the six interactive learning stops
- src/components/: reusable learning interactions and the shared course shell
- e2e/: production-browser and accessibility checks
- .github/workflows/: CI and manual GitHub Pages deployment

src/course/modules/index.ts is the single source of truth for order, routes, navigation, and completion identity.

## Deployment

The repository uses hash routing and relative assets, so it can be hosted from the GitHub Pages subpath:

https://aiml-sdu.github.io/ml-big-data-learning/

Publishing is intentionally manual. Before release, complete the instructor accuracy review and course/RELEASE.md, run the full CI command, then start the GitHub Pages workflow.

## Status

Engineering checks can verify behavior, accessibility, state restoration, and build integrity. They do not replace the instructor's disciplinary and pedagogical review. The first two lectures remain marked as draft until that review is complete.
## Maintainer documentation

- [Instructor tutorial](docs/instructor-tutorial.md)
- [Choosing an agent](docs/choosing-an-agent.md)
- [Debugging guide](docs/debugging.md)
- [Release guide](docs/release-guide.md)
- [Research basis](docs/research-basis.md)
- [Content coverage standard](docs/content-coverage-standard.md)
- [Experience quality standard](docs/experience-quality-standard.md)
- [Theme standard](docs/theme-standard.md)
