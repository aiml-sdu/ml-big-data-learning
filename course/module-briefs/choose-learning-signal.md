# Choose the learning signal

- Status: implemented; instructor review pending
- Kind: lesson
- Source boundary: `materials/slides/Lecture1-Introduction to Big Data Analytics.pptx`, slides 7-44
- Coverage IDs claimed: `COV-001`, `COV-002`, `COV-003`, `COV-004`
- Audience: master's students beginning the course
- Estimated time: 14 minutes
- Previous knowledge this module activates: examples of prediction, grouping, and sequential decisions
- What this module prepares students for next: diagnosing when data scale changes the processing architecture

## Learning objectives

1. Classify a task as supervised, unsupervised, reinforcement, or self-supervised learning from the signal available during learning.
2. Distinguish regression from classification and recognise multivariate outputs.
3. Explain why the application domain alone does not determine the learning paradigm.

## Source notes and terminology

- Slides 7-21 define supervised learning as learning a mapping from paired input and output examples and distinguish regression, classification, univariate, and multivariate outputs.
- Slides 24-34 introduce unlabeled learning through clustering, outliers, missing data, and generation.
- Slides 35-37 define reinforcement learning through states, actions, and rewards and name stochasticity, temporal credit assignment, and exploration versus exploitation.
- Slides 38-44 frame self-supervised learning as pretraining on large corpora and connect capability to model scale, compute, and data curation.
- The module uses new examples rather than republishing source images.

## Coverage evidence

| Coverage ID | Intended depth or performance | Module evidence | Status after implementation |
| --- | --- | --- | --- |
| `COV-001` | classify supervised output types | output-type explanation and satellite transfer check | implemented |
| `COV-002` | distinguish unlabeled structure from labelled prediction | signal-classification activity and feedback | implemented |
| `COV-003` | identify states, actions, and rewards | warehouse-policy case and explanatory feedback | implemented |
| `COV-004` | distinguish self-supervised pretraining | masked-text case and explanatory feedback | implemented |

## Conceptual hinge

The learning paradigm follows the information available during learning. A compelling application label such as health, retail, or robotics does not tell us whether the system learns from labels, structure, or rewards.

## Misconceptions to address

- Every prediction problem is classification.
- Clustering is supervised because a person can name the groups afterwards.
- Reinforcement learning is any model used repeatedly.
- Self-supervised learning means no learning target exists.

## Learning sequence

1. Begin with three familiar evidence types: labelled examples, unlabeled structure, and rewards from actions.
2. Classify four fresh tasks and keep each explanation visible until continuation.
3. Introduce regression, classification, and multivariate outputs after the learner has chosen the learning signal.
4. Use pixel-wise land-cover prediction as a fresh transfer case.

## Learner-facing voice

- Familiar opening situation: four teams say they are building AI, but each receives different evidence.
- Formal terms introduced after: the learner sees labelled examples, unlabeled structure, and rewards.
- Near miss: a task can use images and still be regression, classification, or self-supervised learning depending on its target.
- Cold-read concerns: avoid broad AI history and model-size trivia that do not support the decision.

## Interaction rationale

- AI101 interaction family: construction and diagnosis, followed by prediction and reveal
- Closest course-neutral implementation: `src/components/CategoryChallenge.tsx` and `src/components/KnowledgeCheck.tsx`
- Learner action: classify each task from the signal available during learning
- Conceptual target: learning paradigm and output structure are properties of the learning setup
- Visible response: the selected category remains visible with a reasoned explanation
- Feedback: correct paths name the governing signal; incorrect paths explain the tempting domain-based shortcut
- Completion event: all signal cases are attempted and the independent output check is answered correctly
- Revisit and reset behaviour: stable task and option IDs restore answers and explanations; reset is available
- State model: source task IDs are input; selected categories and correctness are derived; versioned IDs are persisted; current case is navigation state; completed set is terminal; malformed state resets safely
- Stable IDs: `rent-price`, `customer-groups`, `warehouse-policy`, `masked-text`, and output option IDs
- Storage schema: shared component schema version 1 with validation and fresh-state fallback
- Transfer: classify a pixel-wise satellite output by both output type and learning signal

## Assessment and feedback

Formative only. Feedback appears immediately after commitment, explains the reason, and remains until the learner chooses the next case. There is no grade, attempt limit, or reporting.

## Evidence of transfer

The final case changes the domain and representation. Students must recognise paired labels, discrete classes, and many simultaneous outputs rather than repeat the wording of an earlier case.

## Accessibility and media

All core actions are native buttons or radio controls with visible focus. The visual evidence map is semantic HTML with text labels. No slide image or third-party asset is used.

## Visual fit

- Shared course theme followed: yes
- Concept-specific treatment: compact evidence cards using the course palette
- Intentional deviation: none
- Asset and font rights: system fonts and newly authored interface only

## Platform integration

- Uses the shared `LearningModuleLayout`: yes
- Registry position: first module, followed by the data-architecture module
- Dedicated practice flag: no

## Open questions

- Confirm whether the course expects the term self-supervised learning to be distinguished from unsupervised learning at this point.
- Confirm the intended depth for reinforcement-learning difficulties beyond identifying states, actions, and rewards.
