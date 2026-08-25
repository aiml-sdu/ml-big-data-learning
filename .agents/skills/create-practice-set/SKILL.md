---
name: create-practice-set
description: Design, implement, and test an optional formative practice module from instructor-provided questions or source material, including MCQ, classification, flashcards, tracing, ordering, or short application tasks. Use when an instructor asks for practice, revision, quizzes, question banks, or flashcards. Do not use for graded assessment unless policy, security, and answer-release decisions are explicit.
---

# Create a practice set

Build practice that exercises the intended knowledge rather than producing a collection of clicks.

## Establish the practice contract

Read `../../../AGENTS.md`, `../../../course/MEMORY.md`, `../../../materials/course-info.md`, `../../../course/COURSE_PLAN.md`, `../../../docs/content-coverage-standard.md`, `../../../docs/experience-quality-standard.md`, `../../../docs/theme-standard.md`, `../../../docs/practice-standard.md`, `../../../docs/content-voice.md`, and the named source. Confirm the source boundary, coverage IDs, learner, prerequisite, target performance, practice timing, feedback policy, stakes, and publication rights.

Default to formative, browser-local practice with no grades, analytics, login, or instructor reporting. Ask before implementing graded use, delayed answers, attempt limits, randomized banks, or server-side records.

## Choose the response format from the knowledge

- Use flashcards for effortful recall of compact facts, terms, symbols, or paired representations.
- Use MCQ or classification for discriminating among plausible cases when distractors can represent real misconceptions.
- Use ordering or tracing for a process whose sequence matters.
- Use calculation, construction, code, or short explanation when the objective requires producing rather than recognizing an answer.
- Use a static worked example when practice would only ask the learner to copy the page.

Do not convert every source bullet into an MCQ. Do not use flashcards as a substitute for transfer or explanation.

## Design the practice

Write observable practice objectives and identify the misconception or retrieval target for every item. MCQ distractors must be plausible for a stated reason. Feedback explains the rule or evidence for correct and incorrect choices. Flashcards require an attempted recall before reveal and state clearly that self-rating is not a grade.

Link practice to existing coverage items or add an instructor-confirmed item when the practice introduces a genuinely new required performance. Repeating a source label does not create coverage. Recognition-only practice cannot satisfy a production objective.

Use a short progression: activate, practise with feedback, revisit difficult cases, then transfer to a fresh representation or context. If a separate practice experience is useful, register it once as a normal module with `kind: 'practice'` so the shared course path, sidebar, completion, and previous or next navigation still apply.

Use the approved course-wide theme and media treatment. Practice can use a task-specific diagram, but it must not create a separate visual identity or copy an isolated worksheet layout.

## Implement state safely

Reuse `KnowledgeCheck`, `CategoryChallenge`, `FlashcardDeck`, and `LearningFlow` when their semantics fit.

- Give sets, items, options, cards, and steps stable semantic IDs.
- Persist IDs and explicit state versions, never array positions or displayed labels.
- A missing, malformed, stale, or out-of-range saved value must produce a valid fresh state.
- Keep explanations visible until explicit continuation.
- Let learners move backward and forward through resolved items without losing answers or feedback.
- Provide reset and recovery paths.
- Scope storage through `src/lib/courseStorage.ts` and the course's unique `storageNamespace`.

Do not claim spaced repetition unless the implementation actually schedules later retrieval. `FlashcardDeck` is a self-check deck, not a scheduler.

## Verify

Add behavioral tests for fresh load, correct and incorrect answers, retry, reset, option reordering, backward and forward review, reload, malformed storage, and completion where applicable. Run `npm run check:voice`, `npm test`, `npm run build`, and `npm run test:e2e`. Inspect keyboard and 320 px, 390 px, and desktop behavior.

## Handoff

Report the source boundary, coverage IDs, format rationale, item count, feedback policy, persistence behavior, tests, and unresolved assessment or rights decisions. Do not call the practice graded, adaptive, or synchronized unless those capabilities were deliberately implemented and approved.
