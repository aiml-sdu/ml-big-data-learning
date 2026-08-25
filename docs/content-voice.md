# Voice for study content

Study content should sound like a thoughtful instructor who knows where students get stuck. The prose is clear, concrete, and curious. It does not sound like a brochure, a policy document, or a generic AI answer.

## Explain it so a student can rebuild it

Use a Feynman-style progression.

1. Begin with a concrete situation, question, mistake, or choice.
2. Use familiar words before introducing the formal term.
3. Explain the mechanism. Naming a concept is not the same as explaining it.
4. Work through one example slowly enough that the learner can follow each decision.
5. Contrast the example with a tempting near miss or counterexample.
6. Ask the learner to predict, calculate, draw, classify, or explain before revealing the answer.
7. End with a fresh case that checks whether the idea transfers.

A useful test is simple. Could a student close the page and explain the idea to a classmate in their own words? If not, the explanation needs another pass.

## Write like a person

- Prefer plain nouns and verbs. Write `use`, not `leverage`.
- Keep one main idea in each paragraph.
- Vary sentence length naturally. A short sentence can land an important point. A longer sentence can carry a careful explanation.
- Use the instructor's terminology consistently. Do not swap synonyms merely for variety.
- Make transitions carry meaning. Remove sentences that only announce what comes next.
- Use contractions when they fit the instructor's voice and platform language. Study content can sound spoken without becoming sloppy.
- Ask real questions that help the learner think. Avoid decorative questions such as `Have you ever wondered...?`
- Let examples do some of the explaining. Do not repeat the same claim in three polished forms.

## Punctuation and AI-shaped prose

- Use no em dashes in learner-facing prose.
- Do not use double dashes as punctuation.
- Prefer a period or a plain connector over a colon or semicolon when either mark makes the sentence feel staged.
- Avoid balanced slogans such as `not only X but also Y` and `not just X, but Y`.
- Avoid padded groups of three vague adjectives.
- Remove hedge stacks such as `may potentially suggest`.
- Cut empty openers and closers. Start with the actual problem and stop when the idea is complete.

Words and phrases that usually trigger a rewrite include `delve`, `leverage`, `utilize`, `facilitate`, `showcase`, `robust` as praise, `comprehensive` as praise, `moreover`, `furthermore`, `in conclusion`, `it is important to note`, and `to that end`.

These are warning signs, not a thesaurus exercise. Replacing one inflated word with another does not fix a vague sentence. State the concrete action or evidence.

## Keep the learner in the room

- Say why a step matters at the moment it matters.
- Treat wrong answers as reasonable attempts. Explain which assumption led them astray.
- Do not congratulate every click. Reserve praise for reasoning or improvement.
- Never pretend a task is easy. If many learners struggle, name the difficult part and work through it.
- Use examples that match the learners' world, course, and prior knowledge.
- Keep jokes and metaphors only when they clarify the idea and fit the instructor.

## Build a complexity ramp

The opening should make sense to a learner who has the stated prerequisites but has not learned today's vocabulary. Introduce notation and formal language only when they begin to do useful work. Later sections may become technical, but the prose should remain direct.

## Run a cold read

After drafting, read the module as if another instructor sent it to you.

1. Mark any sentence a tired student must reread.
2. Mark any sentence that could appear unchanged in an unrelated course.
3. Mark any paragraph that sounds polished but carries little information.
4. Check that the example, activity, feedback, and final case all teach the same idea.
5. Rewrite the marked passages, then read them again.

Run `npm run check:voice` for the mechanical scan. It catches a small set of strong warning signs. Human review still decides whether the prose feels natural and teaches well.
