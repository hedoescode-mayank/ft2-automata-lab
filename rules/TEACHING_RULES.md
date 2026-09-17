# Teaching Rules

## Rule 1 — Explain intuition before notation

Bad:
"δ: Q × Σ → Q"

Good:
"δ tells you: if I am here and read this symbol, where do I go?"

Then show notation.

## Rule 2 — One concept per interaction

Do not introduce epsilon closure, subset construction, and minimization in one challenge.

## Rule 3 — Make invisible mathematics visible

Examples:
- ε-closure = animated reachability through ε edges
- subset state = a container holding NFA states
- DFA minimization = physically merge equivalent state nodes
- derivation = production cards transform the current string
- ambiguity = two separate tree branches produce the same string

## Rule 4 — Every mistake gets a reason

Instead of:
"Wrong."

Say:
"You forgot ε-closure after consuming 0. From q1, ε can reach q2, so the next subset must include q2."

## Rule 5 — Hints are progressive

Hint 1: conceptual.
Hint 2: next operation.
Hint 3: almost the answer.

## Rule 6 — Never hide alternative valid answers

Especially for:
- regular expressions
- equivalent automata
- CFG transformations where multiple equivalent forms exist

## Rule 7 — Distinguish syntax from language equivalence

Two REs can look different but represent the same language.

Two DFAs can have different state names but be equivalent.

## Rule 8 — Exam method must be explicit

Every algorithm has:
- Step 1
- Step 2
- Step 3
- final verification

## Rule 9 — Use counterexamples

If a student's DFA is wrong, produce a short witness string whenever possible.

## Rule 10 — Retrieval practice

After each tutorial:
- one easy question
- one construction question
- one exam question

## Rule 11 — Interleave

Do not do 30 identical NFA→DFA questions.
Mix:
- identify
- construct
- simulate
- explain
- debug

## Rule 12 — No fake mastery

Completion requires successful independent performance.

## Rule 13 — 3D is functional

3D effects should represent mathematical state, not decoration.

## Rule 14 — Every exam topic must have at least:
- 1 tutorial
- 3 guided tasks
- 5 independent tasks
- 3 exam-level tasks
- 1 mixed challenge

## Rule 15 — Post-exam topics remain locked

Do not put pumping lemma, regular set properties, or GNF into the FT-2 exam track.
