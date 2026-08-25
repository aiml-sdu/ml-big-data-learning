# Repository instructions

## Purpose

This is a course-neutral starter for building an interactive learning companion from instructor-provided material. Treat the instructor as the subject-matter owner and the repository as a persistent collaboration space, not an automatic slide-to-website converter.

The platform should help students reason, practise, and receive useful feedback. It must not merely restyle source material or add decorative interaction.

## Start every course-content task here

1. Read `course/MEMORY.md`, `materials/course-info.md`, `course/COURSE_PLAN.md`, `docs/content-voice.md`, `docs/ai101-reference-standard.md`, and the material named by the instructor.
2. Inspect existing files before asking questions. Do not make the instructor repeat a recorded fact.
3. Identify the exact source boundary: file, slide/page range, lab, or question set.
4. Check whether the learner, target performance, language, depth, stakes, and publication rights are clear enough for the requested work.
5. If a missing answer would materially change the result, ask up to three focused questions and offer a concrete default. Otherwise, state the reasonable assumption and proceed autonomously.
6. Use the matching skill in `.agents/skills/`.

Route work deliberately:

- `manage-course-lifecycle` for setup, tutorials, multi-stage coordination, and “what next?”;
- `onboard-course` for material inventory and a reviewed course map;
- `create-study-module` for one source-bounded lesson;
- `create-practice-set` for optional formative practice, revision, question sets, or flashcards;
- `debug-learning-experience` for interaction, navigation, persistence, responsive, accessibility, or browser-runtime failures;
- `review-learning-module` for critical diagnosis and readiness review;
- `prepare-course-release` for a whole-course pre-publication audit.

Follow the maintained loop in `docs/harness.md`: orient, remember, inspect, clarify, propose, act, verify, reflect, and hand off. Do not silently choose pedagogy, scope, assessment stakes, or publication permissions when the choice matters.

## Source fidelity

- Every non-trivial course claim must be supported by instructor-provided material or an instructor-approved external source.
- Record source paths and slide/page/section locators in each module's `sourceRefs`.
- Distinguish source facts from your examples, analogies, and instructional framing.
- Never invent learning outcomes, formulas, quotations, citations, policies, or assessment rules.
- Flag contradictions or likely errors in the material; do not quietly “correct” the instructor's content.
- A single slide is not automatically a sensible module. If it lacks enough context for a coherent learning objective, say so and propose a better boundary.

## Course content coverage

Follow `docs/content-coverage-standard.md`. During onboarding, assign stable coverage IDs to every instructor-confirmed concept, procedure, representation, misconception, lab capability, and practice expectation in scope. Record the ledger in `course/COURSE_PLAN.md` with source locators, importance, destination, evidence, status, and decision notes.

- Coverage is not a slide count and does not require copying source material.
- A mention is not sufficient when the intended performance requires explanation, calculation, implementation, critique, design, or transfer.
- Every module brief lists the coverage IDs it claims and the exact evidence for them.
- Update coverage when material, briefs, modules, practice, or instructor decisions change.
- At release, every in-scope item must be reviewed, deferred, or excluded. Deferred and excluded items require an instructor-confirmed reason.
- Unassigned, merely planned, unreadable, or uncertain core content blocks release.

Do not optimize a coverage percentage by merging unrelated items or adding superficial mentions. Coverage is necessary but does not prove that the sequence teaches well.

## Instructor interaction

Make the collaboration warm, direct, and easy to answer. Ask questions when ambiguity is consequential. Good questions explain why the answer matters, offer a concrete default, and focus on choices only the instructor can make, for example:

- “Should this module prepare students to explain the method or implement it? I can default to explanation plus one worked example.”
- “May the original diagram be published, or should I recreate an accessible version?”
- “Is this formative practice or graded assessment?”

Ask one to three questions per round, reflect back what you understood, and stop interviewing once the next action is safe. Use `docs/instructor-interview.md` when onboarding or when the course goal is still unclear.

Avoid broad interviews when the material and request are already clear. Do not ask for permission to continue after every reversible implementation choice. Once consequential choices are resolved, carry the task through implementation and verification. During longer work, give concise progress updates and surface decisions early.

## Persistent memory

`course/MEMORY.md` is the canonical, tool-independent memory for this course.

- Record only instructor-confirmed, durable facts, preferences, terminology, constraints, and reusable corrections.
- Do not record guesses, raw conversation transcripts, student or personal data, credentials, or temporary task state.
- If new guidance conflicts with an older entry, preserve the history under “Superseded decisions” and make the current rule unambiguous.
- After changing memory, tell the instructor exactly what was recorded and why it will matter later.
- Task progress and unresolved work belong in the course plan or module brief, not in memory.

## Learning design requirements

Use `docs/learning-design-standard.md` as the maintained quality standard. Each module should normally contain:

- a motivating question or problem;
- two to four observable learning objectives;
- a concise explanation organized around those objectives;
- at least one purposeful activity when interaction improves learning;
- feedback that explains why an answer or action works;
- a short final check for understanding;
- an inspectable source trail.

Each brief must identify the prerequisite, conceptual hinge, likely misconception, and evidence of transfer. Connect the module to what students have already learned and what it prepares them to do next.

Choose the simplest representation that teaches the idea. Prefer a static explanation over a widget when manipulation, prediction, comparison, or feedback adds no learning value. Do not call a module excellent merely because it is polished or passes tests; factual review by the instructor and observation with representative students are still required.

## Content voice

Write learner-facing prose as a thoughtful instructor would explain the idea at a whiteboard. Begin with a concrete situation or useful question. Use familiar words before formal terms, explain the mechanism, work through one example, contrast a near miss, and ask the learner to rebuild the idea on a fresh case.

Follow `docs/content-voice.md`.

- Use no em dashes or double dashes as prose punctuation.
- Prefer plain verbs and concrete nouns. Remove inflated wording, empty transitions, generic praise, and hedge stacks.
- Avoid balanced slogans, padded groups of three, repetitive summaries, and questions that only manufacture excitement.
- Vary sentence length naturally and keep one main idea in each paragraph.
- Run a cold read. Rewrite sentences that feel interchangeable with content from another course.

## Accessibility, privacy, and rights

- All core flows must work with keyboard input and at narrow screen widths.
- Use semantic HTML, visible focus states, labelled controls, sufficient contrast, and reduced-motion support.
- Provide text alternatives for meaningful visuals and do not encode meaning by colour alone.
- Do not place student data, personal data, answer submissions, unpublished exams, licensed readings, or confidential material in `public/` or in the built site.
- Source files in `materials/` are authoring inputs. Do not expose or copy them into the deployed bundle unless the instructor explicitly confirms publication rights.
- The starter stores completion locally in the browser and must not imply that it reports progress to the instructor.

## Architecture

- `materials/`: instructor-owned source material; preserve originals.
- `course/`: persistent memory, planning artifacts, and module briefs.
- `src/course/course.config.ts`: course-wide identity and theme.
- `src/course/modules/`: generated course modules and the module registry.
- `src/components/`: reusable, course-neutral interaction and layout components.
- `.agents/skills/`: canonical cross-agent workflows.
- `.claude/skills/`: generated Claude-compatible mirrors. Edit `.agents/skills/` and run `npm run sync:skills`.
- `docs/`: maintained architecture, workflow, and quality guidance.

Keep reusable mechanics out of course-specific modules. Do not introduce a new dependency when a small accessible React component is sufficient. Preserve hash-based routing and relative Vite assets so GitHub Pages works without server rewrites.

`src/course/modules/index.ts` is the single source of truth for module routes, sidebar navigation, sequence, and previous/next links. A normal module task must use `LearningModuleLayout` and add one registry entry. Do not create a module-specific router, header, sidebar, progress model, or next/previous navigation. Change shared navigation only when the instructor explicitly requests a platform-wide change.

An optional dedicated practice experience is a normal registry entry with `kind: 'practice'`, not a second section with its own router or progress model. Follow `docs/practice-standard.md` and do not default every source item to MCQ.

## Interaction state and navigation

For every stateful activity, model input, derived, persisted, navigation, terminal, and recovery state before implementation.

- Give sets, items, options, cards, and steps stable semantic IDs.
- Persist versioned validated JSON with those IDs, never array positions or displayed labels.
- Treat missing state as fresh and malformed, stale, unknown, or out-of-range state as recoverable.
- Scope storage through `src/lib/courseStorage.ts` and the unique `COURSE.storageNamespace`.
- Preserve resolved answers and feedback when learners move backward, forward, leave, and return.
- Keep feedback visible until explicit continuation; do not auto-advance past it.
- Provide retry or reset and ensure completion callbacks do not fire repeatedly.
- Never coerce a raw `localStorage.getItem()` value with `Number`; a missing value becomes zero and can select the first option.

Use component tests for pure transitions and Playwright for routing, focus, scroll, pointer and keyboard input, persistence, browser errors, and responsive layout. Follow `docs/debugging.md` when a learner flow fails. A review-only or diagnose-only request does not authorize a fix.

`CourseJourney` turns that registry into the winding course path on the home page. Keep it responsive and registry-driven. For new interactive work, read `docs/visualization-standard.md` and inspect the closest course-neutral reference under `src/course/modules/examples/` before designing a new pattern.

Derive one course-wide visual direction from representative material during onboarding. Follow `docs/theme-standard.md`, record the evidence and rationale, and configure semantic light and dark palettes, typography, and geometry in `src/course/course.config.ts`. Preserve recognisable course cues without copying dense slide layouts, inaccessible colour pairs, or assets and fonts without publication rights. Normal modules and practice sets inherit this system rather than inventing source-specific themes.

The visual direction is “Duolingo meets Brilliant”: visible and friendly course progression paired with focused, concept-first interaction. Treat this as a product principle, not a request to copy branding. Keep the learning path more prominent than course statistics or marketing copy, use tactile controls and clear state changes, and avoid interfaces that feel either corporate or childish.

Use `docs/experience-quality-standard.md` to make that ambition operational. It requires course coherence, complete content accounting, meaningful learner action, explanatory feedback, reliable continuity, visual craft, accessibility, and evidence from both instructors and representative learners. Do not claim equivalence with either product based on appearance or automated checks.

`docs/ai101-reference-standard.md` is the pedagogical and interaction benchmark distilled from the AI101 reference. Use its learning rhythm, interaction families, state model, and QA lessons. When the ignored `example/ai101/` checkout is present, inspect one or two mechanically relevant components and their tests or history before building a substantial new interaction. Never copy AI-specific content or depend on the reference checkout at runtime.

## Implementation workflow

For a new module:

1. Create or update `course/module-briefs/<module-slug>.md`.
2. Implement the module in `src/course/modules/` inside `LearningModuleLayout`, using existing components where they fit.
3. Add its metadata and component to `src/course/modules/index.ts`.
4. Add tests for non-trivial interaction logic and update the source trail.
5. Update every claimed coverage item with the exact module evidence and honest status.
6. Run `npm run check:voice`, `npm run check:harness`, `npm test`, and `npm run build`.
7. Run the relevant Playwright path for state, navigation, focus, or responsive changes.
8. Review the rendered module at desktop and 320 px and 390 px mobile widths. Check keyboard operation, answer feedback, and browser errors.

Read `docs/authoring-workflow.md` for the full module lifecycle and `docs/quality-checklist.md` before calling a module ready.

For work spanning several modules, material types, or release lanes, use the coding tool's planning mode when available or maintain a concise visible plan. Planning is not a substitute for acting when implementation is authorized. Do not add planning ceremony to one clear reversible edit.

## Change discipline

- Keep instructor source files unchanged unless the instructor explicitly requests an edit.
- Do not replace unrelated user work or redesign existing modules without permission.
- Keep example content clearly labelled and delete it once real modules replace it.
- Report material assumptions, unresolved content questions, and verification performed.
- Review-only requests do not authorize implementation; diagnose first unless the instructor asks for fixes.

## Required checks

```bash
npm test          # logic, component integration, coverage, voice, and harness contracts
npm run build     # the checks above, TypeScript, and the production bundle
npm run test:e2e  # desktop and mobile browser tests against the production preview
```

Use `npm run ci` as the complete engineering gate and record non-automated evidence in `course/RELEASE.md`. The Pages workflow is manual and also requires `npm run check:release`. Preparing a release does not authorize deployment or changing external repository settings.

Run `npm run sync:skills` after changing canonical skills. `npm run check:skills` verifies the Claude mirrors have not drifted, and `npm run check:harness` checks the portable harness contract.
