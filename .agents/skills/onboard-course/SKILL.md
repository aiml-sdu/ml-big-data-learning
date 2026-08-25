---
name: onboard-course
description: Inspect and organize instructor-provided course materials, interview the instructor about consequential gaps, and produce a reviewed course plan before module generation. Use when starting a new course, importing a body of teaching material, or restructuring the proposed course map. Do not use for implementing an already-scoped module.
---

# Onboard a course

Create an evidence-based course plan that the instructor can correct before implementation begins.

## Inspect first

Read `../../../AGENTS.md`, `../../../course/MEMORY.md`, `../../../materials/course-info.md`, `../../../course/COURSE_PLAN.md`, `../../../docs/content-coverage-standard.md`, `../../../docs/experience-quality-standard.md`, `../../../docs/theme-standard.md`, `../../../docs/content-voice.md`, `../../../docs/ai101-reference-standard.md`, and the material inventory. Inspect the actual source files when current tools support their format. State any extraction limitation, especially for speaker notes, equations, diagrams, scans, or embedded media.

Do not edit original material.

## Learn about the course

Use `../../../docs/instructor-interview.md` as an adaptive question bank, not a questionnaire. Begin with the course's north-star goal: what learners should be able to do, in what situation, and where they currently struggle. Then resolve only the gaps that affect the plan.

Ask one to three focused questions at a time. Explain why each answer matters, offer a concrete default, and briefly reflect back what you heard before the next round. Keep the exchange warm and easy to answer. Do not ask for information already present in the repository.

Determine whether the repository establishes:

- target learners and prior knowledge;
- the platform's role before, during, or after teaching;
- course-level outcomes and relationship to assessment;
- course language and terminology;
- publication constraints;
- the first representative module to pilot;
- the instructor's natural explanation style, preferred examples, and words students already know.
- the stable visual character supported by representative material, including palette roles, typography, geometry, diagram or image treatment, brand constraints, and publication rights;
- whether practice is absent, embedded, a normal module on the shared path, or both, and which response formats fit the target performance;
- the course's unique browser-storage namespace before students begin using the site.

Pause for answers before locking in consequential instructor-owned decisions. For minor gaps, record a labelled assumption.

Update `../../../materials/course-info.md` and `../../../course/MEMORY.md` only with confirmed information. Memory is for durable preferences, terminology, constraints, and reusable corrections. It does not store guesses, transcripts, or temporary planning state. Tell the instructor what you recorded. Once the consequential choices are clear, finish the inventory and draft autonomously.

Inspect several visually representative sources before proposing the course theme. Record paths and locators, cues to preserve, traits to adapt or reject, and asset rights. Translate the confirmed direction into the typed roles in `../../../src/course/course.config.ts`. Do not reproduce slide density, weak contrast, remote fonts, or a guest deck's isolated style. If no stable direction exists, keep the neutral starter and record that decision.

## Build the plan

Update `course/COURSE_PLAN.md` with:

1. a one-sentence course promise;
2. audience, prior knowledge, platform role, and assessment relationship;
3. observable course-level outcomes grounded in the provided course description;
4. a material inventory with publication constraints;
5. a learner model covering prerequisites, current capability, variation, and likely difficulties;
6. a small concept map with dependencies, threshold concepts, and recurring misconceptions;
7. proposed modules grouped by coherent learning outcomes rather than file boundaries;
8. the source boundary, outcome, conceptual hinge, candidate AI101 interaction family, connection to adjacent modules, approximate time, and status for each module;
9. shared notation, terminology, feedback, language, voice, and a source-grounded visual-direction brief following `docs/theme-standard.md`;
10. risks, contradictions, extraction limitations, and open decisions;
11. one recommended vertical slice and why it tests the template well.
12. the practice strategy, feedback and retry policy, and lifecycle evidence still needed before release.
13. a content coverage ledger with stable IDs, source locators, required depth or performance, importance, destination, evidence, status, and decision notes.

Do not implement modules during onboarding. Do not mark the plan approved without instructor confirmation.

Create coverage items at the level of coherent ideas and performances, not one row per slide. Every confirmed in-scope item starts unassigned or planned. Keep unreadable or uncertain source regions visible. Do not mark anything implemented or reviewed during onboarding.

## Quality bar

Be willing to reject a weak module boundary. A slide title is not a learning outcome, and one slide is often too little context for a responsible module. Prefer a smaller number of coherent modules over a page-per-slide mapping. Check that the sequence activates prerequisites and leads toward the course promise rather than producing isolated pages.

Read `../../../docs/learning-design-standard.md` for the quality bar, `../../../docs/authoring-workflow.md` for the maintained lifecycle, and `../../../docs/quality-checklist.md` for constraints that should affect the plan.

## Handoff

Summarize the proposed structure, assumptions, source limitations, decisions needing instructor approval, and any durable memory added or superseded. Recommend the exact next request using `create-study-module` for the pilot, but do not start it until the instructor accepts the plan or explicitly asks to proceed.
