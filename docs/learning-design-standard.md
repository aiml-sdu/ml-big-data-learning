# Learning-design standard

This standard describes the quality target for course modules. It does not prescribe one page template for every discipline.

## 1. Start from the learner's change

Define what changes in the learner: a mental model, discrimination, procedure, judgment, or ability to transfer. Two to four observable objectives are normally enough for one module.

Connect each objective and activity to the course coverage ledger in `course/COURSE_PLAN.md`. Coverage confirms that required material has an instructional destination. Learning design still determines whether students encounter it at the correct depth and in a coherent sequence.

Identify prerequisites. If a prerequisite is uncertain, diagnose or refresh it rather than hiding the gap inside a long explanation.

## 2. Find the conceptual hinge

Locate the distinction, causal mechanism, representation, or decision that makes the topic difficult. Organize the module around that hinge, not around the sequence of slide headings.

Ask:

- What intuitive but wrong model will many students bring?
- What feature distinguishes a correct case from a tempting near miss?
- What should become visible, manipulable, or comparable?

## 3. Build a coherent learning arc

A strong default arc is:

1. activate relevant prior knowledge;
2. pose a meaningful problem, contrast, or prediction;
3. explain the minimum new model needed;
4. model expert reasoning with a worked example;
5. let the learner practise the target decision;
6. give explanatory feedback;
7. fade support and test a new case;
8. connect forward to the next module or course activity.

Use only the stages the objective needs. Avoid making every module feel mechanically identical.

Write the arc in the voice defined by `docs/content-voice.md`. Plain language comes first. Formal vocabulary appears when it helps the learner say something more precisely.

## 4. Make interaction cognitively meaningful

An interaction earns its place when it elicits thinking that the objective requires: prediction, classification, construction, tracing, comparison, parameter exploration, explanation, debugging, or decision-making.

Do not confuse clicks with learning. A static diagram, concise worked example, or well-designed table may be stronger than a widget.

## 5. Design feedback around reasoning

Feedback should identify the rule or evidence, explain why the chosen reasoning succeeds or fails, and point toward a better next attempt. Use plausible distractors linked to real misconceptions. Do not rely on “Correct,” “Try again,” or answer elimination alone.

## 6. Test transfer, not page memory

The final check should use a new representation, parameter, example, or context when the objective requires application. Avoid simply repeating the wording used moments earlier.

## 7. Maintain course coherence

Use the shared application shell, course map, progress behaviour, terminology, notation, feedback tone, and visual tokens. A module may have a distinctive concept-specific interaction, but it may not create its own navigation system or silently change platform behaviour.

The course map is a winding learning path generated from the module registry. Do not replace it inside one module. Interactive visuals follow `docs/visualization-standard.md` and the teaching patterns distilled in `docs/ai101-reference-standard.md`.

The intended product feel combines visible, friendly progression with focused conceptual problem solving. The course should invite another attempt without turning university content into a children's game. Keep the path primary, the current task obvious, and decorative interface secondary. Use `docs/experience-quality-standard.md` for the course-level quality rubric.

## 8. Preserve epistemic honesty

Keep claims traceable to source material. Label instructional analogies and agent-created examples. Surface uncertainty and source conflict. Do not simplify past the point of being false.

## 9. Evaluate with humans

Instructor review establishes disciplinary intent; student testing reveals whether the explanation and interaction actually work. Useful pilot evidence includes:

- where students hesitate or misinterpret controls;
- which distractors attract them and why;
- whether they can explain the core idea afterwards;
- whether they succeed on a new case without page cues;
- time on task and accessibility barriers.

Revise the mental model and feedback before adding more visual polish.
