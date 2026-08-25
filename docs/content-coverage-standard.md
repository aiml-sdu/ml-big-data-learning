# Course content coverage standard

The platform must account for all instructor-confirmed content in scope. Coverage does not mean copying every slide into a page. It means that every required concept, procedure, representation, misconception, lab capability, or practice expectation has an explicit instructional destination or an instructor-approved reason for exclusion.

## Build the coverage ledger

During onboarding, convert the material inventory into coverage items. Use a stable ID such as `COV-001` and record each item in `course/COURSE_PLAN.md`.

| Field | Meaning |
| --- | --- |
| ID | Stable identifier that survives module renaming |
| Source and locator | File plus slide, page, section, cell, or notebook heading |
| Required content or performance | What must be represented or what students must be able to do |
| Importance | Core, supporting, enrichment, or administrative |
| Destination | Module, practice, lab, external activity, or explicit exclusion |
| Evidence | Brief section, module section, activity, feedback, or transfer check |
| Status | Unassigned, planned, implemented, reviewed, deferred, or excluded |
| Decision note | Instructor approval or reason when deferred or excluded |

Choose items at the level of a coherent idea or performance. Do not create one row per slide when several slides explain one mechanism. Do not combine unrelated requirements merely to reduce the row count.

## Coverage states

- **Unassigned:** confirmed in scope but has no destination. This is a release blocker.
- **Planned:** mapped to a reviewed module or practice brief but not implemented.
- **Implemented:** present in the learner experience with a source locator and observable evidence.
- **Reviewed:** implemented and checked by the instructor for disciplinary accuracy and intended depth.
- **Deferred:** intentionally postponed with an instructor-confirmed destination or release boundary.
- **Excluded:** intentionally omitted with an instructor-confirmed reason, such as being out of scope, redundant, restricted, or unsuitable for this platform.

Only `reviewed`, `deferred`, and `excluded` are resolved at release. A release may contain deferred or excluded items, but the record must make those decisions visible. Do not hide gaps behind a percentage.

## What counts as coverage

Coverage can be supplied by explanation, worked example, meaningful visual, practice, lab preparation, transfer task, or an explicit link to an approved course activity outside the platform. The representation must preserve the source's intended meaning and depth.

A mention is not necessarily coverage. A term appearing in a heading does not show that the learner can explain or use it. For core items, require evidence aligned with the intended performance. If students must calculate, implement, critique, or design, recognition-only prose or MCQ is insufficient.

Do not force every source detail into an interactive module. Administrative notices, duplicated examples, optional enrichment, and material without publication rights may be referenced, deferred, or excluded. The instructor owns those decisions.

## Maintain the ledger

- Onboarding creates the first ledger and surfaces extraction limitations.
- Each module brief lists the coverage IDs it claims.
- Module implementation updates claimed items from planned to implemented and links exact evidence.
- Module review changes an item to reviewed only after source comparison and instructor approval.
- Practice links to the knowledge or performance it retrieves; it does not create artificial coverage by repeating labels.
- Release preparation audits every in-scope item and records deferred or excluded decisions.
- Later material changes reopen affected items instead of silently leaving the ledger stale.

When a source cannot be fully inspected, mark the affected coverage uncertain and request instructor review. Never infer that unreadable equations, diagrams, notes, or scans are covered.

## Coverage and sequence

Coverage is necessary but not sufficient. The course plan must also show prerequisites, conceptual dependencies, retrieval opportunities, and transfer. A collection of individually covered items can still form a poor learning sequence.
