# Compress a feature space

- Status: implemented; instructor review pending
- Kind: lesson
- Source boundary: `materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pptx`, slides 31-66
- Coverage IDs claimed: `COV-013`, `COV-014`, `COV-015`, `COV-016`
- Audience: master's students after data diagnosis and normalization
- Estimated time: 20 minutes
- Previous knowledge: features, scale, variance, and a two-dimensional scatter plot
- Prepares for: Lecture 2 pipeline practice and clustering

## Learning objectives

1. Explain why the number of populated regions grows exponentially with dimensionality.
2. Distinguish feature selection, feature extraction, and numerosity reduction.
3. Interpret PCA as a projection that retains high variance with low squared reconstruction loss.

## Source notes and terminology

Slides 31-40 cover the curse of dimensionality, selection, extraction, numerosity reduction, and candidate methods. Slides 41-50 introduce PCA projection, components, variance, and loadings. Slides 51-59 connect covariance, eigenvectors, eigenvalues, and explained variance. Slides 64-66 show image-patch compression. The pilot explains the geometric role without reproducing the source images or malformed equation glyphs.

## Coverage evidence

| Coverage ID | Intended depth | Evidence | Status |
| --- | --- | --- | --- |
| `COV-013` | explain sparsity and reduction families | dimension explorer and case classification | implemented |
| `COV-014` | explain PCA projection and retained variance | projection explorer and feedback | implemented |
| `COV-015` | connect variance objective to component direction | explanation and final transfer | implemented |
| `COV-016` | interpret compression tradeoff | concise application connection; source image not copied | implemented |

## Conceptual hinge

Dimensionality reduction is a choice about representation. Selection keeps original axes. Extraction constructs new axes. PCA chooses orthogonal directions according to variance, not labels.

## Misconceptions to address

- More features always improve a model.
- Selection and extraction are interchangeable names.
- PCA selects the original feature with the largest unit.
- PCA uses class labels to separate groups.

## Learning sequence

Exponential-space explorer, reduction-family diagnosis, direct projection manipulation, and a fresh explanation check.

## Interaction rationale

- AI101 families: parameter explorer, construction or diagnosis, and direct manipulation through an equivalent slider
- Closest reference: `PriceExplorer` plus `CategoryChallenge`
- Learner action: increase dimensions, classify reductions, rotate a projection axis
- Conceptual target: sparse feature spaces and variance-preserving projection
- Visible response: region count, samples per region, projection guides, and retained variance
- Feedback: reduction cases explain what changed; final check connects variance to projection loss
- Completion: all reduction cases attempted and PCA transfer answered correctly
- Revisit and reset: shared stable IDs for assessed state; explorer controls remain valid at every value
- State: local dimension and angle inputs; derived counts and variance; persisted assessed answers; safe recovery
- Transfer: distinguish PCA from label-separating objectives

## Assessment and feedback

Formative, immediate, reasoning-focused, and ungraded.

## Accessibility and media

Both visuals have labelled sliders, live numeric readouts, SVG title and description, text interpretation, keyboard control, and no source image.

## Visual fit

Uses course-neutral points and lines with the shared technical palette.

## Platform integration

Uses the shared layout and registry position 5.

## Open questions

The formal eigenvalue derivation contains extraction artifacts in the source. Confirm whether a later module should include a fully checked derivation or keep the pilot geometric.
