# Module quality checklist

Use this checklist as a review rubric, not as a reason to add unnecessary features. A module is `ready` only when critical issues are resolved and the instructor has reviewed content accuracy.

## Source fidelity

- [ ] The source boundary is explicit and inspectable.
- [ ] Claims, terminology, equations, units, and code match the source.
- [ ] Added examples or analogies are distinguishable from source content.
- [ ] Contradictions or uncertain interpretations are surfaced to the instructor.
- [ ] The source trail uses repository-relative paths and useful locators.

## Course coverage

- [ ] The module brief lists every coverage ID it claims.
- [ ] Each claimed item has evidence at the intended depth, not merely a mention.
- [ ] The course coverage ledger links the source, destination, exact evidence, status, and decision note.
- [ ] Material changes reopen affected coverage items.
- [ ] No unassigned, merely planned, unreadable, or uncertain core item is hidden by a readiness claim.
- [ ] Deferred and excluded items have instructor-confirmed reasons.

## Learning design

- [ ] Required prior knowledge is explicit and activated when needed.
- [ ] The conceptual hinge is identifiable and receives enough attention.
- [ ] Objectives describe observable student performance.
- [ ] The page sequence supports those objectives without unnecessary detours.
- [ ] Each interaction has a stated learning purpose.
- [ ] Each substantial interaction defines a learner action, conceptual target, visible response, feedback, completion event, and transfer check.
- [ ] Feedback explains reasoning and addresses a likely misconception.
- [ ] Explanatory feedback remains visible until the learner chooses to continue.
- [ ] Revisited completed activities restore the resolved answer and explanation.
- [ ] Missing or malformed saved state opens a valid fresh or safely recovered activity.
- [ ] Reordering source options or items cannot restore a different answer.
- [ ] The final check requires independent retrieval or transfer to a fresh case.
- [ ] Estimated completion time is plausible.
- [ ] The module connects coherently to the course plan and adjacent modules.

## Voice and explanation

- [ ] The opening gives the learner a concrete situation, question, mistake, or choice.
- [ ] Plain language explains the mechanism before formal terms carry the argument.
- [ ] The prose includes a useful example and a near miss when the concept needs one.
- [ ] No learner-facing prose contains an em dash, inflated wording, empty signposting, or generic praise.
- [ ] Sentence length and paragraph shape vary naturally.
- [ ] A cold read finds no passage that could be pasted unchanged into an unrelated course.

## Usability and accessibility

- [ ] The course-wide visual direction cites representative material and approved brand guidance.
- [ ] The module inherits the shared palette, typography, geometry, controls, and feedback states.
- [ ] Source cues are adapted for learning rather than copied as a slide layout.
- [ ] Theme assets and fonts have confirmed publication rights.
- [ ] Headings form a meaningful hierarchy.
- [ ] Controls have accessible names and visible focus states.
- [ ] The full activity works with a keyboard.
- [ ] Direct manipulation has a keyboard or control-based equivalent.
- [ ] Correctness is not communicated by colour alone.
- [ ] Meaningful images have text alternatives; decorative images are ignored appropriately.
- [ ] Motion respects `prefers-reduced-motion`.
- [ ] The automated axe scan reports no unreviewed A or AA violation on the home page or any registered module.
- [ ] Automated accessibility results are treated as partial evidence, not a substitute for keyboard, screen-reader, zoom, reflow, and learner review.
- [ ] Content works at 320 px and at a typical desktop width without horizontal overflow.
- [ ] Interactive visuals and the course journey remain usable at 390 px without hover.
- [ ] Back, next, retry, reset, route change, and reload preserve an understandable learner position.
- [ ] Focus moves to meaningful content after an in-page step change and remains visible.

## Privacy and publication

- [ ] No student or personal data is present.
- [ ] No unpublished exam or restricted solution is exposed.
- [ ] Reproduced assets have instructor-confirmed rights and required attribution.
- [ ] Source material has not been copied to `public/` without approval.
- [ ] The UI does not imply that local progress is reported or synchronized.

## Engineering

- [ ] Module metadata is registered once in `src/course/modules/index.ts`.
- [ ] The module uses `LearningModuleLayout` and the shared route, sidebar, progress, and previous/next navigation.
- [ ] Reusable behaviour is separated from course terminology.
- [ ] Non-trivial interaction state has behavioural tests.
- [ ] Tests cover meaningful incorrect, retry, reset, completion, and revisit states where applicable.
- [ ] Stateful sets, items, options, cards, and steps use stable semantic IDs and versioned validated persistence.
- [ ] Storage is course-scoped and unavailable or corrupt storage cannot break the activity.
- [ ] The relevant Playwright path covers the assembled desktop and mobile learner flow against the production bundle.
- [ ] Browser QA reports no uncaught page errors, unexpected console errors, or horizontal overflow.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] `npm run test:e2e` passes for a learner-facing state, navigation, or responsive change.
- [ ] The generated `dist/` contains no restricted material.

## Harness state

- [ ] The agent read existing course memory before asking the instructor to repeat information.
- [ ] Durable memory contains confirmed facts only, with conflicts clearly superseded.
- [ ] Temporary status and unresolved module work remain in the course plan or brief rather than memory.
- [ ] Release evidence, approvals, and rollback notes remain in `course/RELEASE.md` rather than memory.

## Readiness outcome

Record one outcome:

- **ready**: no critical issue; instructor has approved factual content; student validation status is stated honestly;
- **needs revision**: specific issues are actionable;
- **blocked**: a missing source, instructor decision, right, or technical capability prevents a responsible result.

At course release, `ready` also requires every in-scope coverage item to be reviewed, deferred, or excluded and the course-level rubric in `docs/experience-quality-standard.md` to be evaluated honestly.
