---
name: review-learning-module
description: Critically review an existing learning module against its source material, brief, pedagogy, accessibility, privacy, and implementation quality. Use for module review, quality assurance, readiness decisions, or requests to stress-test a generated lesson. Diagnose and report by default; edit only when the instructor explicitly asks for fixes.
---

# Review a learning module

Give the instructor an evidence-backed readiness assessment. Passing builds and polished visuals do not compensate for source drift or weak learning design.

## Establish scope

Identify the target module, its registry metadata, module brief, claimed coverage IDs, and every listed source. If the target is ambiguous, ask one focused question. Read `../../../AGENTS.md`, `../../../course/MEMORY.md`, `../../../course/COURSE_PLAN.md`, `../../../docs/content-coverage-standard.md`, `../../../docs/experience-quality-standard.md`, `../../../docs/theme-standard.md`, `../../../docs/learning-design-standard.md`, `../../../docs/content-voice.md`, `../../../docs/ai101-reference-standard.md`, `../../../docs/visualization-standard.md`, and `../../../docs/quality-checklist.md`.

Review-only requests do not authorize edits. If the instructor asks to review and fix, complete the diagnosis first, then implement scoped fixes.

## Review lanes

### Source fidelity

Compare claims, terminology, notation, examples, answers, and source locators with the actual source. Flag unsupported additions, misleading simplifications, contradictions, and source areas that could not be inspected.

### Coverage

Compare every claimed coverage item with its source, intended depth, and exact module evidence. A term appearing on the page is not sufficient when the required performance is explanation, calculation, implementation, critique, design, or transfer. Identify source content inside the module boundary that has no coverage item and coverage items with no credible evidence. Recommend `reviewed` only after instructor approval; otherwise keep `implemented`, `planned`, or unresolved honestly.

### Learning design

Check alignment among prerequisite, objective, conceptual hinge, explanation, activity, feedback, and final transfer check. For each substantial interaction, identify the learner action, conceptual target, visible response, feedback, completion event, and transfer. Reject decorative interaction, answer cues that trivialize retrieval, vague objectives, and feedback that says only correct or incorrect. Identify the most likely student misconception the module fails to address. Check that the module connects coherently to the course plan and adjacent modules.

### Voice and explanation

Read the learner-facing copy aloud. Check that it starts with something concrete, explains the mechanism before relying on labels, uses examples and near misses well, and introduces formal language at the right time. Flag em dashes, inflated AI-shaped wording, empty transitions, balanced slogans, generic praise, repetitive summaries, and uniform sentence rhythm. Run `npm run check:voice`, then perform a human cold read because the script catches only mechanical signs.

### Accessibility and usability

Exercise the complete flow with a keyboard and at 320 px, 390 px, and desktop widths. Check semantic headings, labels, focus, touch targets, contrast, non-colour cues, text alternatives, reduced motion, overflow, and recovery/reset paths. Confirm that the winding journey remains understandable on mobile. Verify that feedback does not disappear on a timer, completion requires the intended learner action, and a return visit restores the resolved answer and explanation. Direct manipulation must have a keyboard or control-based equivalent.

### Visual fit

Compare the module and shared shell with the approved visual-direction brief and its representative source evidence. Check palette roles, typography, geometry, diagrams, imagery, and degree of formality. Flag source-specific restyling, decorative copying, weak adaptation of material cues, inaccessible source colours, and assets or fonts without confirmed rights. Treat visual fit as course coherence, not a reason to imitate slide layout.

### Privacy and publication

Inspect imports, `public/`, and the production bundle for student data, restricted assessments, copied source decks, unapproved assets, and claims that local progress is synchronized or reported.

### Engineering

Check registry integrity, component boundaries, state transitions, error cases, tests, and build output. Confirm that the module uses `LearningModuleLayout` and the shared registry-driven sidebar, route, progress, and previous/next navigation rather than introducing its own shell. Inspect input, derived, persisted, navigation, terminal, and recovery state. Require stable semantic IDs, versioned validation, course-scoped storage, and safe fresh and malformed-state behavior. Test meaningful incorrect, retry, reset, completion, reordered data, reload, backward, forward, extreme-value, and revisit states where applicable. Run `npm run check:voice`, `npm run check:harness`, `npm test`, `npm run build`, and the relevant Playwright path or `npm run test:e2e` when the environment permits.

## Report

Lead with the readiness outcome: `ready`, `needs revision`, or `blocked`. List findings by severity:

- **Critical**: factual error, wrong answer, privacy/rights exposure, inaccessible core flow, or broken build.
- **Major**: objective/activity mismatch, unsupported claim, misleading feedback, or important unusable path.
- **Minor**: localized clarity, consistency, or maintainability issue.

For each finding, cite the module location and source evidence, explain student impact, and propose the smallest useful correction. Separate verified defects from judgment calls and unresolved instructor decisions. If no issue is found in a lane, say what was checked rather than asserting perfection.

Do not mark a module `ready` merely because automated checks pass. Content approval remains an instructor decision, and representative student observation is the strongest check of whether the design teaches as intended. Evaluate the relevant dimensions of `docs/experience-quality-standard.md` without claiming product equivalence from visual polish.

If the instructor confirms a durable correction during review, update `../../../course/MEMORY.md`, preserve any superseded decision, and report the change. Do not turn reviewer judgments into memory unless the instructor accepts them.
