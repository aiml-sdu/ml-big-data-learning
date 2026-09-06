# Lecture 3: Beyond round clusters

Status: ready for the approved 2026-09-06 release.

## Source boundary
- materials/slides/Lecture3-Clustering.pdf: pp. 21–43

## Intended performance
- Compare single, complete, average, and Ward linkage.
- Identify DBSCAN core, border, and noise points.
- Explain the effects of epsilon and minimum points.

Coverage: COV-024, COV-025, COV-026, COV-027

## Learning contract
- Prerequisite: preceding lecture concepts; basic arithmetic; Python/pandas familiarity for labs. These are the formative release assumptions approved through the deployment request.
- Conceptual hinge: Compare irreversible merges with density-connected groups, including points that do not belong.
- Learner action: dbscan; then a fresh final challenge.
- Visible response: sorting feedback, linked numerical readouts, or a locally saved lab reflection.
- Feedback: calculation mechanism or a reason each option fits or fails.
- Completion event: complete the activity, read the explanation steps, answer the final challenge correctly, then explicitly finish.
- Transfer: A point has too few neighbors to be core, but it lies within ε of a core point. What is it?
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
