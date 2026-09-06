# Machine Learning and Big Data Analytics

An interactive course companion for the University of Southern Denmark course **Machine Learning and Big Data Analytics**.

The student experience is organized into three lectures and nine challenge rounds. It combines concise explanations with quizzes, immediate feedback, XP, saved progress, and interactive visualizations for preprocessing, PCA, exploratory analysis, k-means, DBSCAN, and cluster validation.

## Run locally

Requires Node.js 22.12 or newer.

```bash
npm ci
npm run dev
```

Open the local address printed by Vite.

## Validate

```bash
npm run ci
```

The validation pipeline runs unit and component tests, release and source-coverage checks, desktop and mobile browser tests, accessibility checks, and the production build.

## Deploy

GitHub Actions publishes `main` to GitHub Pages through the manual **Deploy to GitHub Pages** workflow. The release checklist and evidence are recorded in [`course/RELEASE.md`](course/RELEASE.md).

The original slide decks and lab notebooks are authoring sources and are excluded from this public repository and production bundle.

## Maintainer guides

- [Instructor tutorial](docs/instructor-tutorial.md)
- [Choosing an agent](docs/choosing-an-agent.md)
- [Debugging](docs/debugging.md)
- [Release guide](docs/release-guide.md)
- [Research basis](docs/research-basis.md)
- [Content coverage standard](docs/content-coverage-standard.md)
- [Experience quality standard](docs/experience-quality-standard.md)
- [Theme standard](docs/theme-standard.md)
