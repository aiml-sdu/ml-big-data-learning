# Course theme standard

The platform should feel related to the course material without copying the layout of a slide deck. Build one course-wide visual direction during onboarding, apply it through `src/course/course.config.ts`, and keep module mechanics consistent.

## Inspect representative evidence

Sample several sources before proposing a theme. Useful evidence includes title slides, recurring lecture templates, diagrams, lab sheets, course illustrations, and approved institutional guidance. A single guest lecture or decorative cover is weak evidence.

Record the source paths and useful slide, page, or section locators. If sources conflict, prefer the instructor-confirmed course identity. Ask only when the conflict changes brand approval, asset rights, or the intended teaching character.

When no stable visual character is present, use the neutral starter and state that decision. Do not invent a brand story.

## Write a visual-direction brief

The course plan should record:

- three to five concrete words for the intended feel;
- the material cues that support those words;
- palette roles for primary, accent, background, surfaces, text, borders, and semantic feedback;
- a body and heading font stack that can be shipped lawfully and reliably;
- soft, balanced, or crisp geometry;
- the treatment of diagrams, icons, photographs, and data graphics;
- material traits to preserve, adapt, and reject;
- institutional requirements and asset rights;
- instructor approval status.

Terms such as `modern`, `clean`, or `engaging` are too vague on their own. Prefer descriptions that change a design decision, such as `technical and restrained`, `warm field-notebook`, or `formal editorial with sparse colour`.

## Adapt rather than imitate

Preserve recognisable cues such as a characteristic hue, diagram language, degree of formality, or typographic contrast. Translate them into a learning interface.

Do not copy:

- dense slide layouts, small type, weak contrast, or text embedded in images;
- decorative motifs that compete with the learner's task;
- a different theme for each lecture deck;
- logos, illustrations, photographs, or fonts without publication rights;
- colour pairs that fail the repository's accessibility checks.

The source material supplies visual evidence, not permission to reproduce every asset. Recreate a diagram only when rights, attribution, and instructional value are clear.

## Configure semantic roles

`COURSE.theme` contains the course-wide contract.

| Field | Purpose |
| --- | --- |
| `primary` | Dark anchor for navigation, activity panels, and progression |
| `accent` | Filled actions, selected states, and emphasis |
| `light` and `dark` | Separate semantic palettes for backgrounds, surfaces, text, borders, and readable accent text |
| `typography` | Local or system body and heading font stacks |
| `geometry` | `soft`, `balanced`, or `crisp` shared corner treatment |
| `rationale` | Short explanation tied to the source evidence |
| `sourceRefs` | Repository paths and locators used to derive the direction |

Choose role colours rather than pasting source hex values into every component. `primary` and `accent` must remain readable with white text in the existing filled controls. `accentText` is a separate shade for small text on light or dark surfaces. Design dark mode deliberately instead of inverting light colours.

Use system fonts by default. A remote or bundled font needs confirmed rights, a privacy review, and a reliable loading path. Do not make course content depend on a network font.

## Keep modules coherent

A module can use a concept-specific diagram style when the subject requires it, but it must inherit the course typography, palette roles, geometry, controls, navigation, and feedback states. A guest deck or one unusual source should not silently restyle the platform.

If a module needs an intentional deviation, record the reason in its brief. The deviation should clarify the concept, not advertise the source file.

## Verify the result

Review the home page and a representative module beside the source material. Ask whether a learner would recognise the same course without mistaking the platform for a slide viewer.

Run `npm run test:e2e` after theme changes. The browser suite checks the home page, every registered module, both colour schemes, desktop and mobile layouts, and automatically detectable accessibility failures. Also inspect 320 px and 390 px widths, keyboard focus, reduced motion, diagrams, and real material assets manually.
