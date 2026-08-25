# Diagnose before you transform

- Status: implemented; instructor review pending
- Kind: lesson
- Source boundary: `materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pptx`, slides 3-30
- Coverage IDs claimed: `COV-009`, `COV-010`, `COV-011`, `COV-012`
- Audience: master's students after the Lecture 1 field check
- Estimated time: 18 minutes
- Previous knowledge: data objects, attributes, and a model pipeline
- Prepares for: feature-space reduction and PCA

## Learning objectives

1. Diagnose missing, invalid, inconsistent, duplicate, and redundant data.
2. Choose a remedy from the failure rather than applying a fixed cleaning recipe.
3. Calculate and interpret min-max and z-score normalization.

## Source notes and terminology

Slides 3-4 and 18-27 cover dirty data, cleaning, integration, missing values, noise, and redundancy. Slides 5-16 motivate exploration and descriptive inspection. Slides 28-29 define transformation and give the income scaling example used in the explorer.

## Coverage evidence

| Coverage ID | Intended depth | Evidence | Status |
| --- | --- | --- | --- |
| `COV-009` | diagnose data failures | four-case classification | implemented |
| `COV-010` | use inspection before modelling | explanation and diagnosis rationale | implemented |
| `COV-011` | choose cleaning from cause | case feedback and final transfer | implemented |
| `COV-012` | calculate and interpret scaling | live explorer and numeric check | implemented |

## Conceptual hinge

Cleaning corrects a problem in meaning or measurement. Transformation changes representation. Applying transformation before diagnosis can preserve or hide the original error.

## Misconceptions to address

- Every missing value should receive the global mean.
- A numerical value is valid because it can be scaled.
- Duplicate rows are harmless after integration.
- Min-max and z-score scaling answer the same question.

## Learning sequence

Diagnosis cases, scaling explorer, numeric check, and a fresh pipeline-order decision.

## Interaction rationale

- AI101 families: construction or diagnosis and parameter explorer
- Closest references: `CategoryChallenge` and `PriceExplorer`
- Learner action: classify a failure, move one income value, and compare two linked transformations
- Conceptual target: diagnosis precedes remedy; scale interpretations differ
- Visible response: case feedback, normalized values, formulas, and verbal interpretations update together
- Completion: all diagnosis cases attempted and both transfer checks answered correctly
- Revisit and reset: stable IDs and shared versioned storage
- State: explorer input is local; case and check answers persist; malformed storage recovers safely
- Transfer: decide the order of validation, missingness investigation, and normalization

## Assessment and feedback

Formative. Wrong answers explain the rule that the shortcut violates.

## Accessibility and media

Native buttons and labelled range input, live numeric output, text formulas, keyboard path, and no source images.

## Visual fit

Shared course theme, compact numeric comparison, and no copied slide layout.

## Platform integration

Uses the shared layout and registry position 4.

## Open questions

Confirm whether students should calculate z-scores by hand in this course or interpret them only.
