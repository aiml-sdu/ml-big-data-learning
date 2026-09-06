# Lecture 3: Build clusters one step at a time

Status: ready for the approved 2026-09-06 release.

## Source boundary
- materials/slides/Lecture3-Clustering.pdf: pp. 1–20; pp. 55–57

## Intended performance
- Trace k-means assignment and update steps.
- Interpret SSE and the role of initialization.
- Recognize limitations of centroid-based partitions.

Coverage: COV-021, COV-022, COV-023

## Learning contract
- Prerequisite: preceding lecture concepts; basic arithmetic; Python/pandas familiarity for labs. These are the formative release assumptions approved through the deployment request.
- Conceptual hinge: Follow assignments and centroid updates, and see why a lower squared error is only part of the story.
- Learner action: kmeans; then a fresh final challenge.
- Visible response: sorting feedback, linked numerical readouts, or a locally saved lab reflection.
- Feedback: calculation mechanism or a reason each option fits or fails.
- Completion event: complete the activity, read the explanation steps, answer the final challenge correctly, then explicitly finish.
- Transfer: SSE becomes smaller when k increases from 3 to 5. What can you conclude?
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
