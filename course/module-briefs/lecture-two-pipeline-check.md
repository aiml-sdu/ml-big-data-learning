# Lecture 2 pipeline check

- Status: implemented; instructor review pending
- Kind: practice
- Source boundary: `materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pptx`, slides 3-67
- Coverage IDs claimed: `COV-009` to `COV-016` as retrieval and transfer support
- Audience: master's students after modules 4 and 5
- Estimated time: 12 minutes
- Prerequisite: data diagnosis, scaling, reduction families, and PCA intuition
- Prepares for: clustering

## Learning objectives

1. Choose a preprocessing operation from a data failure or representation objective.
2. Explain why validation and scale control precede PCA when units differ.

## Coverage evidence

The practice revisits implemented coverage from modules 4 and 5 with fresh pipeline decisions. It does not introduce a separate coverage claim.

## Conceptual hinge

A pipeline is an ordered set of evidence-based decisions. The same operation can be useful or harmful depending on the failure, model, and units.

## Misconceptions to address

- Every missing value should be imputed immediately.
- PCA ignores units.
- Small numeric values imply unimportant features.
- Selection, extraction, and record summarization are interchangeable.

## Learning sequence

Six mixed operation cases followed by an independent PCA ordering check.

## Interaction rationale

- AI101 family: construction or diagnosis
- Component: `CategoryChallenge` and `KnowledgeCheck`
- Learner action: select the decisive next operation and justify PCA preparation
- Conceptual target: match preprocessing to evidence and preserve variance meaning
- Visible response: persistent selected operation and reasoning feedback
- Completion: all cases attempted and final transfer answered correctly
- Revisit and reset: stable IDs, versioned storage, backward review, and reset
- State: persisted semantic choices and flow position; malformed state falls back safely
- Transfer: network outage, mixed units, sensor selection, PCA, and location summaries

## Assessment and feedback

Formative, immediate, explanatory, and ungraded.

## Accessibility and media

Text scenarios, native buttons and radios, keyboard use, visible progress, no external assets.

## Visual fit

Uses the shared course palette and practice treatment.

## Platform integration

Registered with `kind: 'practice'` as the sixth stop in the shared journey.

## Open questions

Confirm whether a later lab should require students to implement the full preprocessing pipeline in code.
