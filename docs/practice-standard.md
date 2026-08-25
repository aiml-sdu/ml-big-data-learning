# Practice standard

Practice is a learning decision, not a required section. Add it only when retrieval, discrimination, production, or feedback helps students reach the stated outcome.

## Choose the response from the knowledge

| Learner performance | Useful format | Avoid |
| --- | --- | --- |
| Recall a compact fact, term, symbol, or paired representation | Flashcard with attempted recall before reveal | Calling self-rating a grade or spaced repetition |
| Distinguish plausible cases or misconceptions | MCQ or classification | Trivia distractors and obvious wording cues |
| Execute or diagnose a sequence | Ordering, tracing, or step repair | A recognition-only question about the sequence |
| Calculate, construct, code, explain, or critique | Typed, numeric, code, drawing, or structured response | Replacing production with MCQ for implementation convenience |
| Study a fully worked procedure | Worked example with a completion or comparison task | A widget that only reveals the next paragraph |

An item earns its place when it maps to an objective, retrieval target, decision, or misconception. MCQ distractors must be plausible for a documented reason. Feedback explains the governing rule or evidence and addresses why the tempting alternative fails.

## Place practice in the course

Choose one strategy and record it in `materials/course-info.md`:

1. no practice section;
2. embedded checks inside lessons;
3. integrated practice modules on the same course path;
4. both embedded checks and integrated practice modules.

A dedicated practice experience is a normal registry entry with `kind: 'practice'`. It uses `LearningModuleLayout`, the shared sidebar, completion, source trail, and previous or next navigation. Do not create a separate practice router or parallel progress model by default.

## Feedback and progression

- Require a meaningful learner action before showing the answer.
- Explain the reasoning for correct and incorrect paths.
- Keep resolved feedback visible until the learner explicitly continues.
- Let learners move backward and forward without erasing answers or explanations.
- End a set with a fresh case or representation when transfer matters.
- Provide a clear reset that restores a valid initial state.

Do not add points, streaks, badges, timers, or randomization unless they serve a named learning purpose. Do not imply that browser-local completion is synchronized, reported, graded, adaptive, or secure.

## State contract

Every stateful practice component must satisfy this contract:

- sets, items, options, cards, and steps have stable semantic IDs;
- persisted data stores those IDs and an explicit schema version, not array indexes or visible labels;
- storage is scoped through `src/lib/courseStorage.ts` and the course's unique `storageNamespace`;
- missing state means a fresh activity;
- malformed, stale, unknown, or out-of-range state falls back safely;
- resolved answers, feedback, and accessible current position survive valid reload and revisit;
- changing source order does not restore a different answer;
- terminal and reset states are explicit;
- storage failure does not make the activity unusable;
- completion callbacks cannot fire repeatedly from incidental renders.

The first-option regression is a useful warning: `Number(localStorage.getItem(key))` turns a missing value (`null`) into `0`. That silently selects the first array entry. Parse explicit JSON, validate it, and store stable IDs instead.

## Verification

Unit-test fresh, correct, incorrect, retry, reset, reordered data, malformed storage, backward review, forward review, reload, and completion as relevant. Use Playwright for routing, focus, scroll, keyboard, pointer, responsive layout, and browser persistence. Exercise at least 320 px, 390 px, and desktop widths.

Instructor review must confirm disciplinary accuracy and the relationship between distractors, feedback, and likely student reasoning. Representative learner observation remains necessary before strong effectiveness claims.
