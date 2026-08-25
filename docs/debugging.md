# Debugging learner experiences

Debug a learner-visible transition, not merely a component. Record the start state, action, observed result, expected result, viewport, input method, and whether browser storage already existed.

## Fast route from symptom to evidence

| Symptom | First check | Useful command |
| --- | --- | --- |
| First answer appears selected on a fresh visit | Clear or inspect course-scoped storage; look for missing-value coercion | `npm run test:e2e -- --grep "fresh"` |
| Answer changes after content is reordered | Check whether persistence stores array indexes or labels | `npm test -- KnowledgeCheck` |
| Back or next loses feedback | Model current item and answers separately | `npm test -- CategoryChallenge` |
| Works in a component test but not in the app | Reproduce routing, focus, scroll, and browser storage | `npm run test:e2e` |
| Mobile layout clips or scrolls sideways | Inspect at 320 px and 390 px; identify the overflowing element | `npm run test:e2e -- --project=mobile-chromium` |
| Failure occurs only in CI | Open the uploaded Playwright report and trace | `npx playwright show-report` |
| Production differs from development | Test the built Vite preview | `npm run build && npm run preview` |
| Harness or generated skill drift | Read the named contract, then resync canonical skills | `npm run check:harness` |

Install the local browser once with `npx playwright install chromium`. Use `npm run test:e2e:debug` to step through an interaction. Playwright retains traces and screenshots for failed runs; CI uploads `playwright-report/`.

## Model the state before editing

For the failing activity, list:

- input state: source items, option IDs, props, and course namespace;
- derived state: correctness, available steps, progress, and labels;
- persisted state: schema version, stable IDs, and validation;
- navigation state: route, current item, focus, scroll, and reachable back or next paths;
- terminal state: completion and what the learner can review;
- recovery state: retry, reset, malformed storage, and storage unavailable.

Each transition should have one owner. Common causes are array-index persistence, `null` coercion, unvalidated JSON, effects that overwrite input, duplicated routers, implicit auto-advance, callbacks firing on every render, unstable React keys, and layout dimensions measured from the wrong container.

## Reproduce the learner path

1. Start with a fresh course namespace.
2. Repeat the reported action using the reported input method.
3. Try keyboard and pointer input.
4. Exercise back, next, retry, reset, route change, and reload where relevant.
5. Inject malformed or stale state when persistence is involved.
6. watch `console.error`, uncaught page errors, focus position, and horizontal overflow.
7. Repeat at desktop, 390 px, and 320 px when layout can affect the behavior.

Do not force-click a hidden or blocked control to make a browser test pass. Interact with the visible element a student uses. Do not weaken an assertion until the behavior is understood.

## Fix and prevent recurrence

If the request is review or diagnosis, report the cause without editing. If a fix is authorized, correct the shared mechanic when the bug is course-neutral and keep course-specific behavior local. Add the narrowest regression that fails before the correction and one nearby recovery case.

After a fix, run the relevant unit test, `npm run build`, and the relevant Playwright path. If the cause represents an authoring pattern that another agent could repeat, strengthen `AGENTS.md`, a skill, or a maintained standard. Do not rely on conversational memory.
