---
name: create-study-module
description: Plan, implement, test, and visually review one interactive learning module grounded in a specific course-material boundary. Use when an instructor asks to create, build, or revise a study module, lesson, topic page, or interactive activity from slides, labs, readings, or practice material. Do not use for whole-course planning or review-only requests.
---

# Create a study module

Build one complete, source-traceable learning experience. The instructor owns content decisions; the agent owns making implementation and learning-design tradeoffs visible.

## Establish the brief

Read `../../../AGENTS.md`, `../../../course/MEMORY.md`, `../../../materials/course-info.md`, `../../../course/COURSE_PLAN.md`, `../../../docs/content-coverage-standard.md`, `../../../docs/experience-quality-standard.md`, `../../../docs/theme-standard.md`, `../../../docs/learning-design-standard.md`, `../../../docs/content-voice.md`, `../../../docs/ai101-reference-standard.md`, `../../../docs/visualization-standard.md`, the named source, and any existing brief. Confirm:

- exact file and slide/page/section boundary;
- audience and assumed prior knowledge;
- target student performance;
- role and stakes of the activity;
- language, terminology, and publication constraints.

If a consequential item is unclear, ask up to three focused questions, explain why they matter, and provide a reasonable default. Do not ask about preferences already recorded in memory. If the instructor requests “slide 1” but that boundary cannot support a coherent objective, explain the problem and propose a specific better boundary. Do not pad thin material with invented claims. Once consequential choices are resolved, implement and verify the module without repeatedly asking permission for reversible choices.

Create or update `course/module-briefs/<slug>.md` using the repository template. Record the coverage IDs claimed, intended depth, exact planned evidence, prerequisite, conceptual hinge, likely misconception, evidence of transfer, adjacent-module connection, assumptions, and open questions.

## Work from the source

Extract the concepts, notation, examples, steps, and likely misconceptions relevant to the confirmed objective. Record uncertainty when the available tools cannot inspect part of a file. Never claim to have read speaker notes, diagrams, equations, or embedded media that were not actually accessible.

Keep every substantial claim supported by an instructor source or an instructor-approved external source. Distinguish new instructional examples from source content. Surface possible source errors or contradictions to the instructor instead of silently correcting them.

## Design the learning sequence

Use two to four observable objectives. Organize the minimum content needed to meet them. Make the conceptual hinge explicit. This is the idea or distinction students must genuinely grasp. A useful default is motivation or prediction, explanation, worked example, purposeful activity, explanatory feedback, and an independent transfer check.

Write from the concrete to the formal. Use a familiar situation first, explain the mechanism in plain language, then introduce notation or specialist terms when they begin to help. Include a near miss that exposes the likely misconception. Read the draft cold and rewrite any sentence that sounds generic, inflated, repetitive, or interchangeable with another course.

Choose interaction only when it helps students predict, classify, compare, manipulate, construct, trace, or receive contingent feedback. Use prose, code, a table, or a static visual when that communicates more clearly.

Follow the approved course-wide visual direction. Use its semantic palette, typography, geometry, and media treatment through the shared shell. A source-specific diagram can keep subject-relevant conventions, but one module must not restyle navigation, controls, or feedback to match an isolated deck. Record any intentional deviation and its learning reason in the brief.

When a visual interaction is justified, select its family from `../../../docs/ai101-reference-standard.md` and write the six-line interaction contract in the brief: learner action, conceptual target, visible response, feedback, completion event, and transfer. Inspect the closest course-neutral implementation in `../../../src/course/modules/examples/`.

When `../../../example/ai101/` is present, inspect one or two components with the closest learner action plus any shared hook, test, or repair history that governs the mechanic. Reuse principles and failure lessons, not subject matter, prose, assets, or dependencies. The finished module must work when the ignored reference checkout is absent.

## Implement

1. Add the module component under `src/course/modules/` and frame it with the shared `LearningModuleLayout`.
2. Reuse course-neutral components when their semantics fit; keep concept-specific code local.
3. Add exactly one metadata entry to `src/course/modules/index.ts`, including repository-relative `sourceRefs` and meaningful locators. The ordered registry supplies routes, sidebar items, and previous/next navigation.
4. Make correct and incorrect paths produce reasoning-focused feedback.
5. Keep feedback visible until the learner explicitly continues. Persisted completion must restore the resolved answer and explanation on revisit.
6. Preserve keyboard operation, semantic structure, visible focus, contrast, reduced motion, and narrow-screen behaviour. Provide an alternative to drag-only or shape-click-only tasks.
7. Do not import or publish original material merely to display it. Confirm rights before reproducing an asset.
8. Add behavioural tests for non-trivial state, incorrect and recovery paths, revisit behaviour, and relevant registry invariants.
9. Update claimed coverage items to implemented only when the learner experience contains the required evidence. Link the exact section, activity, feedback, or transfer check. Leave instructor review pending.

For every stateful activity, define input, derived, persisted, navigation, terminal, and recovery state in the brief. Give items and options stable semantic IDs, use versioned validated persistence through `src/lib/courseStorage.ts`, and treat missing or malformed data as a valid fresh or recovered state. Never persist array positions or displayed labels. Preserve resolved answers and feedback through previous, next, route change, and reload.

For a normal module task, do not add or edit a module-specific router, header, sidebar, progress store, or sequence control. Do not edit `App.tsx` or shared navigation unless a genuine platform-wide change is in scope.

## Verify

Run `npm run check:voice`, `npm run check:harness`, `npm test`, `npm run build`, and the relevant Playwright path or `npm run test:e2e`. Inspect the rendered module at desktop and at 320 px and 390 px widths. Exercise every activity path with mouse and keyboard. Follow its previous/next links to confirm the shared course sequence. Check browser and page errors, horizontal overflow, and that restricted material is absent from `dist/`.

Use `../../../docs/quality-checklist.md` and `../../../docs/experience-quality-standard.md` for the final pass. Mark the registry status `ready` only when critical issues are resolved and the instructor has approved factual content; otherwise leave it `draft`.

## Handoff

If the instructor confirms a durable preference or corrects a reusable fact during the work, update `../../../course/MEMORY.md` and say what changed. Do not store task status or an unconfirmed inference there.

Report the module path, source boundary, coverage IDs and statuses, objectives, conceptual hinge, interaction rationale, assumptions, tests, visual/accessibility checks, sequence integration, and unresolved instructor decisions. Do not imply that passing tests proves pedagogical or factual correctness.
