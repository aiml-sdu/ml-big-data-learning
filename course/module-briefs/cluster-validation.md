# Lecture 3: Are these clusters useful?

Status: ready for the approved 2026-09-06 release.

## Source boundary
- materials/slides/Lecture3-Clustering.pdf: pp. 44–64

## Intended performance
- Distinguish internal, external, and relative validation.
- Calculate SSE, purity, and silhouette on small examples.
- Explain why a validation score needs context.

Coverage: COV-028, COV-029, COV-030, COV-031

## Learning contract
- Prerequisite: preceding lecture concepts; basic arithmetic; Python/pandas familiarity for labs. These are the formative release assumptions approved through the deployment request.
- Conceptual hinge: Separate internal structure from agreement with known labels, and calculate what the scores actually measure.
- Learner action: silhouette; then a fresh final challenge.
- Visible response: sorting feedback, linked numerical readouts, or a locally saved lab reflection.
- Feedback: calculation mechanism or a reason each option fits or fails.
- Completion event: complete the activity, read the explanation steps, answer the final challenge correctly, then explicitly finish.
- Transfer: A point has a = 4 and b = 2. What does its silhouette of −0.5 suggest?
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
