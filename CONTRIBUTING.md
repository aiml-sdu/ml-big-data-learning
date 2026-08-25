# Contributing to the template

This repository keeps `main` stable and uses `dev` for proposed improvements.

## Contribution flow

1. Open an issue first when the change affects architecture, pedagogy, privacy, deployment, or the instructor workflow.
2. Create a branch or private fork from `dev`.
3. Make one focused change and add or update the relevant tests and documentation.
4. Run `npm run ci` locally.
5. Open a pull request into `dev` and complete the pull request checklist.
6. Address review comments and wait for the GitHub checks to pass.

Maintainers periodically promote reviewed changes from `dev` to `main` through a pull request. Do not target `main` directly unless the change is an urgent repair requested by a maintainer.

Course material, student information, credentials, unpublished assessments, and licensed readings must not be added to this template repository.

Repository access is intentionally narrow. Instructors normally receive read access and contribute through pull requests. Private forking must also be enabled by an `aiml-sdu` organisation owner.

## Review expectations

A useful contribution should:

- remain course-neutral;
- preserve the documented instructor and learner workflows;
- include source evidence for pedagogical or factual claims;
- work with keyboard input and narrow screens;
- preserve validated, ID-based interaction state;
- pass the repository voice, harness, unit, build, and browser checks.

Passing CI is necessary but does not replace instructor review or learner testing.
