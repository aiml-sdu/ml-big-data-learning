---
name: debug-learning-experience
description: Reproduce, diagnose, and when requested fix learner-facing interaction, navigation, persistence, responsive-layout, accessibility, or browser-runtime failures in the learning platform. Use for stuck activities, wrong restored answers, lost progress, broken back or next behavior, visual overflow, console errors, or inconsistent state after reload. Diagnose by default when the request does not authorize a fix.
---

# Debug a learning experience

Find the failed state transition and leave a regression test that describes the learner-visible behavior.

## Reproduce before editing

Read `../../../AGENTS.md`, the affected module and brief, the relevant shared component, `../../../docs/debugging.md`, and existing tests. Restate the exact start state, learner action, observed result, and expected result. Reproduce with the same viewport and input method when known.

Exercise at least:

- fresh browser storage;
- the reported action with mouse or touch and keyboard;
- back, next, retry, reset, route change, and reload as relevant;
- malformed or stale persisted state when persistence is involved;
- console errors and unhandled page errors;
- 320 px or 390 px when the failure could be responsive.

Use Playwright traces and screenshots for browser-only failures. Component tests are appropriate for pure state transitions, but they do not replace a real-browser reproduction of routing, focus, scroll, pointer, or layout failures.

## Model the state

List the interaction's input state, derived state, persisted state, navigation state, terminal state, and recovery path. Check that each transition has one owner. Inspect for unstable identifiers, state derived from array position, missing-value coercion, unvalidated JSON, effects that overwrite user input, automatic navigation, duplicated routers, and completion callbacks that can fire repeatedly.

The safe persistence contract is versioned data with stable semantic IDs, explicit validation, a valid fresh fallback, course scoping, and graceful behavior when browser storage is unavailable.

## Fix proportionally

If the instructor asked only for diagnosis, report the cause and smallest correction without editing. If a fix is authorized, correct the shared mechanic when the defect is course-neutral and keep concept-specific behavior local. Preserve source content and unrelated work.

Add the narrowest regression that fails before the correction and passes after it. Test the original failure plus one nearby recovery path. Do not weaken the assertion, force-click through an unusable control, or hide a browser error to make CI pass.

## Verify and hand off

Run `npm test`, `npm run build`, and the relevant Playwright test or `npm run test:e2e`. Report the root cause, affected states, correction, regression evidence, browser and viewport coverage, and anything not reproduced. If the failure came from a reusable authoring mistake, propose a harness or skill correction rather than relying on memory alone.
