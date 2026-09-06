# Course plan

Status: **ready**

Lifecycle stage: **release**

## Course promise
Practice the reasoning behind learning paradigms, data preparation, and clustering through three lecture paths.

## Confirmed scope
Use the supplied three PDFs and two notebooks; use the downloaded repository as the template; preview locally before deployment. Organize by lectures, use a white background, add game-like challenges, quizzes and visualizations, and omit student-facing slide pointers.

## Design assumptions
English, formative practice, basic arithmetic and Python familiarity for lab preparation. No grading, login, analytics, or synchronized progress. Time estimates are author estimates. Course learning goals are draft instructional interpretations, not approved official outcomes.

## Course visual direction
- Representative source evidence and locators: Lecture 1 p. 1, Lecture 2 p. 29, Lecture 3 p. 35, visually inspected. White technical pages with blue conceptual emphasis.
- Direction: white, precise, tactile, exploratory.
- White page backgrounds explicitly requested; system fonts; blue actions and labelled scientific plots. No copied logos, photos, or fonts.
- Instructor approval: current composition approved through the explicit deployment request on 2026-09-06.

## Lecture structure
- Lecture 1: What can a machine learn?; Choose a data architecture.
- Lecture 2: Make the data comparable; Keep the useful directions; Lab · Explore the Chicago data.
- Lecture 3: Build clusters one step at a time; Beyond round clusters; Are these clusters useful?; Lab · Compare clustering methods.

## Content coverage ledger

| ID | Source and locator | Required content or performance | Importance | Destination | Evidence | Status | Decision note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| COV-001 | materials/slides/Lecture1-Introduction to Big Data Analytics.pdf, pp. 7–44 | Start with the target | core | Lecture 1, What can a machine learn? | lessonContent.ts: learning-paradigms/targets | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-002 | materials/slides/Lecture1-Introduction to Big Data Analytics.pdf, pp. 7–44 | When there is no supplied label | core | Lecture 1, What can a machine learn? | lessonContent.ts: learning-paradigms/structure | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-003 | materials/slides/Lecture1-Introduction to Big Data Analytics.pdf, pp. 7–44 | Learning through consequences | core | Lecture 1, What can a machine learn? | lessonContent.ts: learning-paradigms/rewards | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-004 | materials/slides/Lecture1-Introduction to Big Data Analytics.pdf, pp. 7–44 | Apply the idea and transfer to a fresh case | core | Lecture 1, What can a machine learn? | CourseActivities.tsx: paradigms; final challenge | reviewed | New formative examples approved through the explicit deployment request on 2026-09-06 |
| COV-005 | materials/slides/Lecture1-Introduction to Big Data Analytics.pdf, pp. 45–end; course outline pp. 2–3 | A sale and a sales report ask different things | core | Lecture 1, Choose a data architecture | lessonContent.ts: big-data-systems/workloads | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-006 | materials/slides/Lecture1-Introduction to Big Data Analytics.pdf, pp. 45–end; course outline pp. 2–3 | More data changes the bottleneck | core | Lecture 1, Choose a data architecture | lessonContent.ts: big-data-systems/scale | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-007 | materials/slides/Lecture1-Introduction to Big Data Analytics.pdf, pp. 45–end; course outline pp. 2–3 | Match the architecture to the decision | core | Lecture 1, Choose a data architecture | lessonContent.ts: big-data-systems/architectures | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-008 | materials/slides/Lecture1-Introduction to Big Data Analytics.pdf, pp. 45–end; course outline pp. 2–3 | Apply the idea and transfer to a fresh case | core | Lecture 1, Choose a data architecture | CourseActivities.tsx: systems; final challenge | reviewed | New formative examples approved through the explicit deployment request on 2026-09-06 |
| COV-009 | materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pdf, pp. 3–29 | Inspect before you transform | core | Lecture 2, Make the data comparable | lessonContent.ts: clean-transform/inspect | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-010 | materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pdf, pp. 3–29 | Every cleaning choice makes an assumption | core | Lecture 2, Make the data comparable | lessonContent.ts: clean-transform/clean | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-011 | materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pdf, pp. 3–29 | Change the scale, not the underlying observation | core | Lecture 2, Make the data comparable | lessonContent.ts: clean-transform/scale-values | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-012 | materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pdf, pp. 3–29 | Apply the idea and transfer to a fresh case | core | Lecture 2, Make the data comparable | CourseActivities.tsx: normalization; final challenge | reviewed | New formative examples approved through the explicit deployment request on 2026-09-06 |
| COV-013 | materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pdf, pp. 31–67 | A larger feature set can make learning harder | core | Lecture 2, Keep the useful directions | lessonContent.ts: pca/reduction | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-014 | materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pdf, pp. 31–67 | Which line loses the least information? | core | Lecture 2, Keep the useful directions | lessonContent.ts: pca/projection | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-015 | materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pdf, pp. 31–67 | Keep enough components for your purpose | core | Lecture 2, Keep the useful directions | lessonContent.ts: pca/components | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-016 | materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pdf, pp. 31–67 | Apply the idea and transfer to a fresh case | core | Lecture 2, Keep the useful directions | CourseActivities.tsx: pca; final challenge | reviewed | New formative examples approved through the explicit deployment request on 2026-09-06 |
| COV-017 | materials/labs/Exercise2_data_exploration.ipynb, All notebook sections; materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pdf, pp. 7–16 | Start with the supplied data | core | Lecture 2, Lab · Explore the Chicago data | lessonContent.ts: exploration-lab/setup | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-018 | materials/labs/Exercise2_data_exploration.ipynb, All notebook sections; materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pdf, pp. 7–16 | Represent meaning, not just parser types | core | Lecture 2, Lab · Explore the Chicago data | lessonContent.ts: exploration-lab/features | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-019 | materials/labs/Exercise2_data_exploration.ipynb, All notebook sections; materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pdf, pp. 7–16 | Use a plot that can answer the question | core | Lecture 2, Lab · Explore the Chicago data | lessonContent.ts: exploration-lab/plots | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-020 | materials/labs/Exercise2_data_exploration.ipynb, All notebook sections; materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pdf, pp. 7–16 | Apply the idea and transfer to a fresh case | core | Lecture 2, Lab · Explore the Chicago data | CourseActivities.tsx: eda; final challenge | reviewed | New formative examples approved through the explicit deployment request on 2026-09-06 |
| COV-021 | materials/slides/Lecture3-Clustering.pdf, pp. 1–20; pp. 55–57 | Similarity depends on representation | core | Lecture 3, Build clusters one step at a time | lessonContent.ts: kmeans/groups | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-022 | materials/slides/Lecture3-Clustering.pdf, pp. 1–20; pp. 55–57 | What exactly gets smaller? | core | Lecture 3, Build clusters one step at a time | lessonContent.ts: kmeans/objective | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-023 | materials/slides/Lecture3-Clustering.pdf, pp. 1–20; pp. 55–57 | Apply the idea and transfer to a fresh case | core | Lecture 3, Build clusters one step at a time | CourseActivities.tsx: kmeans; final challenge | reviewed | New formative examples approved through the explicit deployment request on 2026-09-06 |
| COV-024 | materials/slides/Lecture3-Clustering.pdf, pp. 21–43 | Build a hierarchy of merges | core | Lecture 3, Beyond round clusters | lessonContent.ts: density-hierarchy/merge | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-025 | materials/slides/Lecture3-Clustering.pdf, pp. 21–43 | A cluster can follow dense neighborhoods | core | Lecture 3, Beyond round clusters | lessonContent.ts: density-hierarchy/density | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-026 | materials/slides/Lecture3-Clustering.pdf, pp. 21–43 | Different strengths, different failure modes | core | Lecture 3, Beyond round clusters | lessonContent.ts: density-hierarchy/limits | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-027 | materials/slides/Lecture3-Clustering.pdf, pp. 21–43 | Apply the idea and transfer to a fresh case | core | Lecture 3, Beyond round clusters | CourseActivities.tsx: dbscan; final challenge | reviewed | New formative examples approved through the explicit deployment request on 2026-09-06 |
| COV-028 | materials/slides/Lecture3-Clustering.pdf, pp. 44–64 | First ask what evidence you have | core | Lecture 3, Are these clusters useful? | lessonContent.ts: cluster-validation/evidence | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-029 | materials/slides/Lecture3-Clustering.pdf, pp. 44–64 | Agreement is more than one kind of match | core | Lecture 3, Are these clusters useful? | lessonContent.ts: cluster-validation/external | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-030 | materials/slides/Lecture3-Clustering.pdf, pp. 44–64 | Compactness and separation need to be read together | core | Lecture 3, Are these clusters useful? | lessonContent.ts: cluster-validation/internal | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-031 | materials/slides/Lecture3-Clustering.pdf, pp. 44–64 | Apply the idea and transfer to a fresh case | core | Lecture 3, Are these clusters useful? | CourseActivities.tsx: silhouette; final challenge | reviewed | New formative examples approved through the explicit deployment request on 2026-09-06 |
| COV-032 | materials/labs/Exercise3_clustering.ipynb, Preprocessing, aggregation, and all six clustering sections | The map is not the space being clustered | core | Lecture 3, Lab · Compare clustering methods | lessonContent.ts: clustering-lab/geo | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-033 | materials/labs/Exercise3_clustering.ipynb, Preprocessing, aggregation, and all six clustering sections | Change one choice at a time | core | Lecture 3, Lab · Compare clustering methods | lessonContent.ts: clustering-lab/methods | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-034 | materials/labs/Exercise3_clustering.ipynb, Preprocessing, aggregation, and all six clustering sections | Make a comparison someone else can inspect | core | Lecture 3, Lab · Compare clustering methods | lessonContent.ts: clustering-lab/record | reviewed | Instructor approved the current preview for deployment on 2026-09-06 |
| COV-035 | materials/labs/Exercise3_clustering.ipynb, Preprocessing, aggregation, and all six clustering sections | Apply the idea and transfer to a fresh case | core | Lecture 3, Lab · Compare clustering methods | CourseActivities.tsx: lab-record; final challenge | reviewed | New formative examples approved through the explicit deployment request on 2026-09-06 |
| COV-CONTEXT | Lecture 1 pp. 2–6; image-only and historical illustration slides across supplied PDFs | Administrative scope and supporting historical illustrations beyond the implemented learning path | supporting | Excluded from first web release | Omitted from learner interface and production bundle | excluded | Instructor authorized deployment of the current preview on 2026-09-06 |

## Interpretation notes for instructor review
- Lecture 2 p. 55 reverses eigenvalue/eigenvector labels. The preview uses Ax = lambda x with x the vector and lambda the scalar.
- Lecture 2 p. 22 rounds bin means; preview arithmetic uses exact means 9, 22.75, 29.25.
- Lecture 3 silhouette values can be negative; the preview uses the full [-1,1] range.
- DBSCAN convention is inclusive MinPts including the observation; border ties use first-reachable assignment rather than the lecture pseudocode's closest core.
- Self-supervised training is distinguished from zero-shot application.
- Chicago administrative categories are not asserted to form a strict geographic hierarchy.
- Source PDFs were text-extracted fully and three representative pages visually inspected. Image-only regions and fine mathematical figures have not received a complete visual audit.

## Data availability
The Chicago CSV and preprocessed GeoNames files referenced by the labs were not supplied. Lab guidance is usable; full Python experiments require those data and Jupyter. Browser plots use fixed synthetic data.

## Review state
All nine rounds are implemented and approved for this release through the instructor's explicit deployment request. Representative learner observation was not run and is recorded as a limitation rather than claimed evidence. Supporting source illustrations are excluded from this release.

