---
name: manage-course-lifecycle
description: Guide an instructor through template setup, course onboarding, a pilot module, scaled authoring, review, release, and post-pilot iteration. Use for end-to-end planning, tutorial walkthroughs, release coordination, or “what should I do next?” requests. Do not use instead of a named skill for one already-scoped module, practice set, bug, or review.
---

# Manage the course lifecycle

Help the instructor take the next responsible step without making them manage the repository process.

## Orient to the current stage

Read `../../../README.md`, `../../../course/MEMORY.md`, `../../../materials/course-info.md`, `../../../course/COURSE_PLAN.md`, `../../../course/RELEASE.md`, `../../../docs/harness.md`, `../../../docs/content-coverage-standard.md`, `../../../docs/theme-standard.md`, and `../../../docs/experience-quality-standard.md`. Inspect the actual materials, coverage ledger, visual-direction evidence, briefs, registry, checks, and current changes needed to establish which stage is real rather than trusting a status label alone.

Use these stages:

1. **Template setup**: repository created, dependencies installed, course identity, neutral starter theme, and storage namespace still generic.
2. **Discovery**: materials, coverage items, and material-grounded visual direction are being inventoried and consequential course decisions are unresolved.
3. **Pilot**: the course plan exists and one representative vertical slice is being built or tested.
4. **Scale**: the pilot pattern has instructor approval and additional modules or practice sets are being produced.
5. **Review**: modules exist but source, pedagogy, accessibility, state, and learner-flow evidence need critical review.
6. **Release**: coverage resolution, content approval, rights, learner evidence, browser QA, CI, and deployment evidence are being assembled.
7. **Iteration**: instructor or student observations are being converted into scoped corrections and durable memory.

Do not advance a stage because files exist. A generated module is not an approved pilot, and a passing build is not a release decision.

Do not advance to scale while core coverage remains unassigned, the course visual direction is still an unsupported guess, or the pilot has not tested the experience-quality bar. Do not advance to release while in-scope items remain unassigned, merely planned, unreadable without resolution, or implemented without the required instructor review.

## Choose the next workflow

- Use `onboard-course` for discovery and the reviewed course map.
- Use `create-study-module` for one source-bounded learning module.
- Use `create-practice-set` for optional formative practice.
- Use `debug-learning-experience` for a reproducible interaction, navigation, persistence, or responsive failure.
- Use `review-learning-module` for evidence-backed module review.
- Use `prepare-course-release` for whole-course release readiness.

State the stage, the evidence for it, the next outcome, and the named workflow. Do not load every workflow when one is sufficient.

## Plan at the right scale

For work spanning several modules, material types, or release gates, use the agent's planning mode when available or maintain a concise visible plan. Recommend planning mode when the instructor is still comparing consequential directions. Do not propose it as ceremony for one reversible edit, and do not stop at a plan when the request authorizes implementation.

Ask up to three questions only when the answers change pedagogy, scope, assessment stakes, rights, privacy, or the release decision. Offer a concrete default. Continue autonomously through safe local implementation and verification after those decisions are resolved.

## Protect the pilot loop

Do not generate a whole course before one representative module has been reviewed by the instructor and observed with plausible learners. Use that pilot to test course-path clarity, meaningful learner action, feedback, continuity, visual craft, accessibility, and the coverage workflow. When scaling, carry forward only confirmed teaching preferences and demonstrated reusable corrections. Keep temporary progress in `course/COURSE_PLAN.md`, briefs, or `course/RELEASE.md`; keep durable instructor-confirmed context in `course/MEMORY.md`.

## Handoff

Report the current stage, coverage status, experience-quality evidence, blockers, files or state updated, and the exact next prompt an instructor can use. If the request was only for lifecycle advice, do not mutate course content or release external state.
