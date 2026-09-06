# Lecture 1: Choose a data architecture

Status: ready for the approved 2026-09-06 release.

## Source boundary
- materials/slides/Lecture1-Introduction to Big Data Analytics.pdf: pp. 45–end; course outline pp. 2–3

## Intended performance
- Compare OLTP and OLAP access patterns.
- Explain ETL and the role of distributed storage and processing.
- Match batch and streaming architectures to a use case.

Coverage: COV-005, COV-006, COV-007, COV-008

## Learning contract
- Prerequisite: preceding lecture concepts; basic arithmetic; Python/pandas familiarity for labs. These are the formative release assumptions approved through the deployment request.
- Conceptual hinge: Separate transactional work from analytics, and decide when a stream needs a faster response.
- Learner action: systems; then a fresh final challenge.
- Visible response: sorting feedback, linked numerical readouts, or a locally saved lab reflection.
- Feedback: calculation mechanism or a reason each option fits or fails.
- Completion event: complete the activity, read the explanation steps, answer the final challenge correctly, then explicitly finish.
- Transfer: A continuously arriving log is only used for an overnight report. Must every event be analyzed immediately?
- Likely misconception: addressed by the incorrect options in the final challenge.

## State contract
- Input: fixed teaching data and stable topic/option identifiers.
- Derived: numerical metrics and correctness.
- Persisted: course-scoped, versioned validated activity JSON; explicit resolved quiz answers.
- Navigation: shared lecture shell and LearningFlow, with keyed topic transitions.
- Terminal: 50 XP once per unique finished round; the lecture completes after all its rounds.
- Recovery: incorrect answers can be revised; experiments have reset controls; malformed storage recovers to defaults.

## Distinctions
Synthetic examples are instructional framing, not original datasets. Lab reflection completion is self-reported, not auto-grading. Source locators are retained here for instructor inspection and omitted from the student interface at the instructor's request.
