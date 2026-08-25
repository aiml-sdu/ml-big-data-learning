# Course plan

Status: **pilot in implementation; instructor review pending**

Lifecycle stage: **pilot**

## Course promise

This platform helps master's students turn machine-learning and big-data concepts into decisions they can explain, test, and reuse in a new analytics problem.

## Audience and role

- Learners: master's students in Machine Learning and Big Data Analytics
- Prior knowledge: introductory statistics and programming are assumed for the pilot, pending confirmation
- Platform role: intuition-first companion and revision environment
- Relationship to assessment: formative only; no grades, analytics, login, or instructor reporting

## Learner model

- Learners have seen basic data tables and programming constructs, but their mathematical and distributed-systems experience may vary.
- They can describe familiar ML examples but may not yet distinguish the learning signal, output type, data-quality failure, or scaling pressure that governs a technical choice.
- Likely sticking points include treating labels as a minor detail, using big data as a synonym for volume, cleaning data without diagnosing the failure, assuming normalization methods are interchangeable, and assuming more features always improve a model.
- The platform uses concise technical English, visible terminology, keyboard alternatives, and persistent feedback to support variation in confidence and language fluency.

## Course-level outcomes

1. Classify an analytics task by learning paradigm, output structure, and required data signal.
2. Explain when data volume, variety, velocity, workload, and latency change the processing architecture.
3. Diagnose incomplete, noisy, inconsistent, redundant, and high-dimensional data before choosing a remedy.
4. Apply and compare common transformations, reductions, and feature-engineering decisions.
5. Choose, implement, and evaluate suitable ML methods for clustering, regression, classification, neural networks, and ensembles.
6. Explain how Hadoop, MapReduce, Spark, MLlib, NoSQL systems, and streaming architectures support data-intensive analytics.

## Course visual direction

- Direction: technical, restrained, spacious, analytical
- Representative source evidence and locators: Lecture 1 slides 1 and 64; Lecture 2 slides 14, 31, and 59
- Cues to preserve: strong dark typography, generous white space, simple blue quantitative marks, direct institutional tone
- Traits to adapt or reject: replace dense bullet pages and tiny embedded labels; avoid copied logos, photographs, and third-party figures
- Light palette: warm off-white background, white surface, pale blue-grey secondary surface, charcoal text, blue accent
- Dark palette: deep navy background, blue-grey surfaces, near-white text, lighter blue accent
- Typography: system sans-serif for reliable publishing; strong weight contrast instead of decorative fonts
- Geometry and density: balanced corners, one cognitive task per main section, compact supporting controls
- Data graphics: labelled line and point marks, non-colour state cues, text descriptions, and course-neutral SVG where needed
- Brand and asset rights: institution name in text only; SDU logo and slide imagery remain unapproved
- Instructor approval: pending

## Concept map and difficult transitions

- A task begins with the signal available to learn from. Labels support supervised learning, structure without labels supports unsupervised learning, and rewards support reinforcement learning.
- The output type then narrows the task. Continuous values imply regression while discrete categories imply classification; many outputs add a second dimension to the decision.
- Data scale is not only size. Variety changes representation, velocity changes latency, and workloads determine whether transactional, analytical, batch, or streaming systems fit.
- Model quality depends on data quality. Missingness, noise, inconsistency, redundancy, scale, and dimensionality require different diagnoses.
- Feature selection keeps original variables. Feature extraction constructs a new representation. PCA is one extraction method that preserves as much variance as possible under a linear projection.
- Later modelling modules depend on these decisions, and the distributed-systems modules explain how the same pipeline changes when one machine is no longer enough.

## Proposed modules

| No. | Module | Source boundary | Intended outcome | Conceptual hinge or misconception | Interaction family and learner action | Connection | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Choose the learning signal | Lecture 1, slides 7-44 | Classify a task by learning signal and output type | The model family follows the evidence available, not the buzzword in the application | Classification challenge: choose, receive feedback, transfer | opens the course language | implementing |
| 2 | When data changes the architecture | Lecture 1, slides 45-92 | Diagnose scale pressure and match batch, analytical, or streaming architecture | Big data is volume plus representation, latency, workload, and coordination pressure | Parameter explorer and architecture diagnosis | prepares distributed systems | implemented |
| 3 | Lecture 1 field check | Lecture 1, slides 7-92 | Retrieve and apply the two core decisions in fresh cases | Recognition of terms can hide weak task framing | Mixed formative practice | consolidates Lecture 1 | implemented |
| 4 | Diagnose before you transform | Lecture 2, slides 3-30 | Identify a data-quality failure and select a defensible remedy | Missing, noisy, inconsistent, and redundant data are not one problem | Data diagnosis cases and scaling explorer | prepares feature engineering | implemented |
| 5 | Compress a feature space | Lecture 2, slides 31-66 | Distinguish selection, extraction, and PCA; reason about retained variance | More features can increase sample needs and noise | Dimension explorer and PCA projection | prepares clustering and models | implemented |
| 6 | Lecture 2 pipeline check | Lecture 2, slides 3-67 | Build and justify a preprocessing sequence on a fresh dataset | A pipeline must be chosen from the failure and target model | Mixed formative practice and ordering | consolidates Lecture 2 | implemented |
| 7 | Discover groups without labels | Lecture 3, full deck | Explain and apply clustering mechanisms | Similarity and cluster validity depend on representation and scale | to be defined after source inspection | depends on preprocessing | proposed |
| 8 | Fit and interpret regression | Lecture 4, full deck | Fit, interpret, and diagnose linear regression | Fit, assumptions, and generalization are separate questions | to be defined after source inspection | uses transformed features | proposed |
| 9 | Build a classification decision | Lecture 5, full deck | Compare fundamental classifiers and their decision boundaries | Similar training accuracy can hide different inductive biases | to be defined after source inspection | builds on supervised framing | proposed |
| 10 | Learn with neural networks | Lecture 6, full deck | Trace forward learning and parameter updates | Depth and nonlinearity change representation, not the learning objective | to be defined after source inspection | extends supervised models | proposed |
| 11 | Combine and evaluate models | Lecture 7, full deck | Compare ensemble mechanisms and evaluation evidence | Better training fit is not better generalization | to be defined after source inspection | supports model choice | proposed |
| 12 | Compute with Hadoop and MapReduce | Lecture 8, full deck | Trace distributed storage and MapReduce execution | The framework separates the requested computation from fault-tolerant execution | to be defined after source inspection | realizes Lecture 1 architecture | proposed |
| 13 | Work with Spark | Lecture 9 decks, full decks | Explain Spark execution and use core programming patterns | Lazy plans, partitions, and actions govern performance | to be defined after source inspection | builds on MapReduce | proposed |
| 14 | Scale ML with MLlib | Lecture 10, full deck | Build and evaluate an ML pipeline in Spark | Distributed model APIs still require sound data and evaluation choices | to be defined after source inspection | joins ML and big data | proposed |
| 15 | Choose a distributed data store | Lecture 11, full deck | Compare NoSQL and distributed storage models | Access pattern and consistency needs shape the store | to be defined after source inspection | extends workload decisions | proposed |
| 16 | Reason about fast data | Lecture 12, full deck | Trace streaming state, latency, and fault tolerance | Streaming is an evolving computation, not repeated batch by default | to be defined after source inspection | closes architecture sequence | proposed |

## Shared conventions

- Language and terminology: English; preserve source terms and define them in plain language before using them formally
- Mathematical and code notation: introduce symbols beside a numeric or visual example; never rely on a broken source glyph
- Feedback style: explain the governing rule and the tempting misconception; keep feedback visible until explicit continuation
- Interaction rhythm: concrete case, learner commitment, visible consequence, formal name, near miss, fresh transfer
- Visual system: course-wide theme only; concept diagrams inherit shared controls and feedback states
- Release constraints: original decks, logos, third-party images, and restricted material stay out of the production bundle
- Navigation and progress: shared registry and winding course path
- Practice strategy: embedded checks plus one integrated practice module after each implemented lecture sequence
- Practice feedback and retry: immediate explanation, explicit continue, revisit, and reset; no grades or attempt limits
- Browser storage namespace: `sdu-ml-big-data-2026`

## Material inventory

| Path | Type | Relevant topics | Publication constraint | Notes |
| --- | --- | --- | --- | --- |
| `materials/course-info.md` | context | course-wide | repository source | Current assumptions and open decisions |
| `materials/slides/Lecture1-Introduction to Big Data Analytics.pptx` | PowerPoint, 93 slides | learning paradigms, big data, workloads, cloud, batch and streaming | local authoring only | text and rendered slides inspected; 33 note files mostly empty |
| `materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pptx` | PowerPoint, 67 slides | exploration, cleaning, transformation, reduction, PCA | local authoring only | text and rendered slides inspected; some equation glyphs need source review |
| `Lecture3-Clustering.pptx` | PowerPoint, 64 slides | clustering | external authoring source | filename and slide count inventoried only |
| `Lecture4-Linear Models for Regression.pptx` | PowerPoint, 81 slides | regression | external authoring source | filename and slide count inventoried only |
| `Lecture5-Fundamental Classification Algorithms.pptx` | PowerPoint, 90 slides | classification | external authoring source | filename and slide count inventoried only |
| `Lecture6-Artificial Neural Networks.pptx` | PowerPoint, 80 slides | neural networks | external authoring source | filename and slide count inventoried only |
| `Lecture7-Ensemble Methods and Model Evaluations.pptx` | PowerPoint, 83 slides | ensembles and evaluation | external authoring source | filename and slide count inventoried only |
| `Lecture8-Hadoop Fundamentals and MapReduce.pptx` | PowerPoint, 115 slides | Hadoop and MapReduce | external authoring source | filename and slide count inventoried only |
| `Lecture9-Apache Spark Essentials.pptx` | PowerPoint, 64 slides | Spark | external authoring source | filename and slide count inventoried only |
| `Lecture9-Spark Programming Using Scala.pptx` | PowerPoint, 48 slides | Spark programming and Scala | external authoring source | filename and slide count inventoried only |
| `Lecture10-Machine Learning with MlLib.pptx` | PowerPoint, 85 slides | MLlib | external authoring source | filename and slide count inventoried only |
| `Lecture11-NoSQL Databases and distributed data storages.pptx` | PowerPoint, 75 slides | NoSQL and distributed stores | external authoring source | filename and slide count inventoried only |
| `Lecture12-Data Streaming and Fast Data.pptx` | PowerPoint, 60 slides | streaming and fast data | external authoring source | filename and slide count inventoried only |

## Content coverage ledger

| ID | Source and locator | Required content or performance | Importance | Destination | Evidence | Status | Decision note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `COV-001` | Lecture 1, slides 7-21 | Distinguish supervised regression, classification, univariate, and multivariate outputs | core | choose-learning-signal | problem framing, classification activity, transfer check | implemented | instructor review pending |
| `COV-002` | Lecture 1, slides 24-34 | Explain unsupervised learning through clustering and generative examples | core | choose-learning-signal | explanation, contrast, classification activity | implemented | instructor review pending |
| `COV-003` | Lecture 1, slides 35-37 | Identify states, actions, rewards, and the main reinforcement-learning difficulties | supporting | choose-learning-signal | mechanism explanation and fresh-case feedback | implemented | instructor review pending |
| `COV-004` | Lecture 1, slides 38-44 | Explain self-supervised pretraining, model scale, data curation, and compute pressure | supporting | choose-learning-signal | contrast section and task classification | implemented | instructor review pending |
| `COV-005` | Lecture 1, slides 45-50 | Diagnose volume, variety, and velocity as distinct data pressures | core | data-changes-architecture | parameter explorer and transfer scenario | implemented | instructor review pending |
| `COV-006` | Lecture 1, slides 51-58 | Compare OLTP, OLAP, ETL, data warehouses, and Hadoop batch support | core | data-changes-architecture | workload comparison and architecture diagnosis | implemented | instructor review pending |
| `COV-007` | Lecture 1, slides 59-73 | Explain parallelization challenges and the separation of computation from execution | core | data-changes-architecture | worker simulation and what-versus-how explanation | implemented | instructor review pending |
| `COV-008` | Lecture 1, slides 74-92 | Match batch, real-time store, streaming, and lambda-style use cases to latency needs | core | data-changes-architecture | architecture cases and fresh transfer | implemented | instructor review pending |
| `COV-009` | Lecture 2, slides 3-4 and 18-27 | Diagnose incomplete, noisy, inconsistent, duplicate, and redundant data | core | diagnose-before-transform | case classification and reasoning feedback | implemented | instructor review pending |
| `COV-010` | Lecture 2, slides 5-16 | Use visualization and descriptive statistics to inspect patterns, skew, dispersion, outliers, and correlation | supporting | diagnose-before-transform | visual comparison and interpretation check | implemented | instructor review pending |
| `COV-011` | Lecture 2, slides 19-24 | Choose a defensible treatment for missing or noisy data and explain its tradeoff | core | diagnose-before-transform | remediation cases and near-miss feedback | implemented | instructor review pending |
| `COV-012` | Lecture 2, slides 28-29 | Apply min-max and z-score normalization and distinguish their interpretation | core | diagnose-before-transform | scaling explorer and calculation transfer | implemented | instructor review pending |
| `COV-013` | Lecture 2, slides 31-40 | Explain the curse of dimensionality and distinguish feature selection, extraction, and numerosity reduction | core | compress-feature-space | dimension explorer and classification cases | implemented | instructor review pending |
| `COV-014` | Lecture 2, slides 41-50 | Explain PCA as a lower-dimensional projection that retains high-variance directions | core | compress-feature-space | projection visual and reconstruction comparison | implemented | instructor review pending |
| `COV-015` | Lecture 2, slides 51-59 | Connect covariance, eigenvectors, eigenvalues, and explained variance to choosing components | supporting | compress-feature-space | linked explanation and scree-style transfer | implemented | equation glyphs require instructor check |
| `COV-016` | Lecture 2, slides 64-66 | Interpret the compression tradeoff in the image-patch example | supporting | compress-feature-space | application comparison | implemented | original images will not be republished |
| `COV-FUTURE-03` | Lecture 3, full deck | Inspect and map clustering content before implementation | unresolved | future onboarding | no learner evidence yet | unassigned | source not yet inspected in detail |
| `COV-FUTURE-04` | Lecture 4, full deck | Inspect and map regression content before implementation | unresolved | future onboarding | no learner evidence yet | unassigned | source not yet inspected in detail |
| `COV-FUTURE-05` | Lecture 5, full deck | Inspect and map classification content before implementation | unresolved | future onboarding | no learner evidence yet | unassigned | source not yet inspected in detail |
| `COV-FUTURE-06` | Lecture 6, full deck | Inspect and map neural-network content before implementation | unresolved | future onboarding | no learner evidence yet | unassigned | source not yet inspected in detail |
| `COV-FUTURE-07` | Lecture 7, full deck | Inspect and map ensemble and evaluation content before implementation | unresolved | future onboarding | no learner evidence yet | unassigned | source not yet inspected in detail |
| `COV-FUTURE-08` | Lecture 8, full deck | Inspect and map Hadoop and MapReduce content before implementation | unresolved | future onboarding | no learner evidence yet | unassigned | source not yet inspected in detail |
| `COV-FUTURE-09A` | Lecture 9 Apache Spark Essentials, full deck | Inspect and map Spark essentials before implementation | unresolved | future onboarding | no learner evidence yet | unassigned | source not yet inspected in detail |
| `COV-FUTURE-09B` | Lecture 9 Spark Programming Using Scala, full deck | Inspect and map Spark programming content before implementation | unresolved | future onboarding | no learner evidence yet | unassigned | source not yet inspected in detail |
| `COV-FUTURE-10` | Lecture 10, full deck | Inspect and map MLlib content before implementation | unresolved | future onboarding | no learner evidence yet | unassigned | source not yet inspected in detail |
| `COV-FUTURE-11` | Lecture 11, full deck | Inspect and map NoSQL and distributed storage content before implementation | unresolved | future onboarding | no learner evidence yet | unassigned | source not yet inspected in detail |
| `COV-FUTURE-12` | Lecture 12, full deck | Inspect and map streaming and fast-data content before implementation | unresolved | future onboarding | no learner evidence yet | unassigned | source not yet inspected in detail |

## Risks and unresolved decisions

- Publication rights for logos, third-party diagrams, photographs, and cited source material are not confirmed, so the implementation uses new course-neutral visuals only.
- Some equation symbols in Lecture 2 do not extract correctly. The numeric examples and visible rendered slides were used where the meaning was clear; formal PCA equations require instructor review.
- Speaker notes are sparse and sometimes contain authoring reminders rather than teaching explanation.
- The full course sequence is a provisional map until Lectures 3 to 12 are inspected in detail.
- Course code, exact term, prerequisites, contact information, and visual-direction approval remain open.

## Pilot decision

- First vertical slice: `choose-learning-signal`, based on Lecture 1 slides 7 to 44
- Why it is representative: it combines a difficult classification decision, a plausible misconception, several output structures, and an interaction that can preserve feedback and transfer to a fresh case
- Instructor approval: implementation explicitly requested; factual and pedagogical review pending

## Lifecycle evidence

- Template setup: clean copy created from `aiml-sdu/ml-big-data`; previous ad hoc project preserved in `ml-big-data-learning-legacy-20260825`
- Material inventory: 13 decks and 1,005 slides inventoried; Lectures 1 and 2 extracted and rendered
- Coverage ledger and scope decisions: drafted; instructor review pending
- Pilot implementation and browser QA: in progress
- Instructor factual review: pending
- Representative learner observation: pending
- Release record: see `course/RELEASE.md`

