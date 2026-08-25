# When data changes the architecture

- Status: implemented; instructor review pending
- Kind: lesson
- Source boundary: `materials/slides/Lecture1-Introduction to Big Data Analytics.pptx`, slides 45-92
- Coverage IDs claimed: `COV-005`, `COV-006`, `COV-007`, `COV-008`
- Audience: master's students after the learning-signal module
- Estimated time: 17 minutes
- Previous knowledge: task framing and learning paradigms
- Prepares for: Lecture 1 practice and later Hadoop, Spark, NoSQL, and streaming modules

## Learning objectives

1. Diagnose volume, velocity, and variety as different system pressures.
2. Match OLTP, OLAP, distributed batch, and streaming workloads to a decision need.
3. Explain why a distributed runtime separates the requested computation from worker coordination.

## Source notes and terminology

Slides 45-50 introduce big-data pressures. Slides 51-58 contrast OLTP and OLAP and show the ETL bottleneck. Slides 59-73 describe parallelization, cloud resources, and the separation of what from how. Slides 74-92 compare batch, real-time stores, streaming buffers, engines, and lambda-style architecture.

## Coverage evidence

| Coverage ID | Intended depth | Evidence | Status |
| --- | --- | --- | --- |
| `COV-005` | diagnose three pressures | pressure explorer | implemented |
| `COV-006` | compare transaction and analytical workloads | architecture cases | implemented |
| `COV-007` | explain runtime abstraction | final explanation and transfer check | implemented |
| `COV-008` | match batch and streaming use cases | architecture cases and latency control | implemented |

## Conceptual hinge

Architecture follows workload and decision latency. A technology name is not a substitute for describing how data arrives, how soon an answer has value, and how work can be divided.

## Misconceptions to address

- Big data means volume only.
- A data warehouse should serve user-facing transactions and large scans equally.
- Streaming means a fast batch that runs often.
- The analyst should manually coordinate every worker.

## Learning sequence

Pressure explorer, architecture diagnosis, explanation of runtime abstraction, and a fresh responsibility check.

## Interaction rationale

- AI101 family: parameter explorer and construction or diagnosis
- Closest reference: `PriceExplorer` plus `CategoryChallenge`
- Learner action: change workload pressure and classify cases
- Conceptual target: workload and latency govern the architecture
- Visible response: pressure labels and starting-path recommendation update together
- Feedback: each case explains the decisive access or latency pattern
- Completion: all cases attempted and runtime responsibility answered correctly
- Revisit and reset: shared stable IDs and versioned component storage
- State: local explorer input and derived recommendation; persisted case answers; explicit completion and safe recovery
- Transfer: distinguish an analyst-owned question from a runtime-owned failure-recovery task

## Assessment and feedback

Formative, immediate, explanatory, revisitable, and ungraded.

## Accessibility and media

All sliders have visible labels and live readouts. Architecture cases use buttons with text, keyboard access, and non-colour feedback. No source image is copied.

## Visual fit

Shared theme followed. The pressure readout uses restrained technical controls and text labels rather than slide imagery.

## Platform integration

Uses `LearningModuleLayout`, registry position 2, and shared previous and next navigation.

## Open questions

Confirm whether lambda architecture should be named explicitly in the pilot or reserved for the later streaming lecture.
