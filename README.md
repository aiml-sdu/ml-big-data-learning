# ML & Big Data Course

An interactive self-study platform for the first four lectures of SDU's Machine Learning and Big Data Analytics course.

## Learning structure

Each lecture is a module with five conceptual activities, a guided tutorial lab, and a six-question independent practice set:

1. Big Data and ML Foundations
2. Data Preprocessing and Feature Engineering
3. Clustering
4. Linear Regression

The four labs are adapted from the course's Week 1–4 notebooks and datasets: Python/NumPy/Pandas, Chicago Crime and Spotify preprocessing, GeoNames world-city clustering, and linear regression with SciPy, statsmodels, NumPy, and PyTorch. Each lab includes starter code, progressive hints, self-checks, and a completion summary.

The light-interface activities introduce a problem before formalizing the concept. They use manipulable visual models, immediate feedback, and unscaffolded end-of-lecture questions. The platform intentionally does not use XP, answer streaks, or leaderboards.

## Local development

```bash
pnpm install
pnpm dev
```

## Production build

```bash
pnpm build
```

The Vite build uses relative asset paths, so the generated `dist` directory can be hosted as a GitHub Pages project site.
