# FT-2 Interactive 3D Learning Platform — Master Plan

## Mission

Build an interactive, game-like web learning platform for **Formal Languages & Automata Theory (FT-2)**.

The learner should not merely read theory. They should:
1. Understand the concept visually.
2. Build automata by dragging states and transitions.
3. Enter strings and watch execution step-by-step.
4. Generate/read transition tables.
5. Convert between representations.
6. Solve guided tutorial activities.
7. Complete exam-style challenges.
8. Get immediate validation and explanations.
9. Progress through a game-like 3D world.

## FT-2 Scope

### Unit 1
1. NFA (with and without epsilon) → DFA conversion
2. DFA minimization
3. Regular expressions for given languages
4. RE → FA
5. FA → RE
6. Equivalence of NFA and DFA
7. Two-Way Finite Automata
8. Moore and Mealy machines
9. Equivalence of Moore and Mealy machines

### Unit 2
1. CFG
2. Derivation trees
3. Ambiguous and unambiguous grammars
4. CFG simplification
   - Elimination of useless symbols
   - Elimination of unit productions
   - Elimination of null productions
5. Chomsky Normal Form (CNF)

Explicitly EXCLUDE from FT-2 exam gameplay:
- Properties of regular sets
- Pumping lemma
- Greibach Normal Form

These can be an optional post-exam expansion.

---

# Core Product Principle

**Every concept must have three layers:**

### Layer A — Understand
Animated explanation + tiny example + glossary.

### Layer B — Interact
Manipulate the actual mathematical object.

### Layer C — Prove/Perform
Exam-style task where the learner must construct the answer.

A topic is considered mastered only after the learner can perform the operation, not merely recognize it.

---

# Game World

Create a stylized 3D "Automata Lab".

The world contains zones:

1. **Gate of Finite Automata**
   - DFA/NFA basics
   - string simulation

2. **Epsilon Reactor**
   - ε-NFA
   - epsilon closure
   - subset construction

3. **Minimization Forge**
   - distinguishability
   - partition refinement
   - minimized DFA

4. **Regex Observatory**
   - language descriptions
   - RE construction
   - RE ↔ FA

5. **Equivalence Arena**
   - NFA vs DFA
   - equivalence reasoning

6. **Two-Way Lab**
   - two-way finite automata

7. **Machine Theater**
   - Moore and Mealy machines
   - conversion/equivalence

8. **Grammar Temple**
   - CFG
   - derivation trees
   - ambiguity

9. **Grammar Cleanup Plant**
   - null/unit/useless production elimination

10. **CNF Factory**
   - step-by-step CNF transformation

Each zone unlocks after completing prerequisite missions.

---

# Interaction Model

## State Node

Each state is a draggable 3D/2D hybrid object.

Properties:
- state ID
- start flag
- final flag
- position
- highlight state
- transition connections

Interactions:
- drag
- click
- double click to edit
- right click/context menu
- toggle start
- toggle accepting
- delete
- duplicate

## Transition

Transitions are draggable curved edges.

Properties:
- source
- destination
- input symbols
- epsilon flag
- label
- self-loop support

For NFA, multiple destinations for one symbol are allowed.

For DFA, validator must enforce:
- exactly one transition per state-symbol pair
- no epsilon transition

## String Runner

User enters a string.

The runner:
- resets automaton
- highlights current state(s)
- consumes one symbol at a time
- shows active configuration
- shows accepted/rejected result
- explains why

For NFA:
- visualize the set of active states
- show branching paths
- show epsilon transitions where applicable

For DFA:
- show exactly one active state.

---

# Transition Table

The table must stay synchronized with the graph.

DFA:

| State | 0 | 1 |
|---|---|---|
| q0 | q1 | q0 |

NFA:

| State | 0 | 1 |
|---|---|---|
| q0 | {q0,q1} | {q2} |

ε-NFA adds:

| State | ε |
|---|---|
| q0 | {q1} |

Editing either representation updates the other.

---

# Tutorial Pattern

Every tutorial follows:

1. Objective
2. Intuition
3. Vocabulary
4. Visual example
5. Tiny worked example
6. Interactive manipulation
7. Guided challenge
8. Independent challenge
9. Exam question
10. Explanation of common mistakes
11. Mastery check

Do not dump textbook paragraphs first.

---

# Universal Activity Engine

Every activity should support:

- instruction
- current state
- hints
- validation
- mistake feedback
- partial credit
- reset
- solution reveal after configurable attempts
- XP
- streak
- completion
- difficulty
- tags
- expected representation

Activity types:

1. Build DFA
2. Build NFA
3. Build ε-NFA
4. Run string
5. Complete transition table
6. Convert NFA → DFA
7. Identify epsilon closure
8. Minimize DFA
9. Construct regex
10. Convert RE → FA
11. Convert FA → RE
12. Prove/verify equivalence
13. Simulate 2DFA
14. Convert Moore ↔ Mealy
15. Build CFG
16. Derive string
17. Build derivation tree
18. Detect ambiguity
19. Remove null productions
20. Remove unit productions
21. Remove useless symbols
22. Convert CFG → CNF
23. Exam simulation

---

# Visual Language

Use:
- dark laboratory environment
- glowing nodes
- animated transitions
- readable labels
- high contrast
- subtle grid
- clean typography
- no visual effects that reduce mathematical clarity

3D should enhance manipulation, not make diagrams harder to read.

Recommended:
- Three.js for the visual scene
- React/TypeScript for UI/state
- SVG/HTML overlays for crisp labels and tables
- Zustand or equivalent for global state
- deterministic automata engine separate from renderer

---

# Important Architecture Rule

The mathematical engine must NOT depend on Three.js.

Use a pure domain model:

Automaton
→ State
→ Transition
→ Alphabet
→ InitialState
→ AcceptingStates

Then adapters:
- 3D renderer
- transition table
- simulator
- validator
- exporter

This makes testing possible.

---

# Learning Progression

## Phase 0 — Foundation
- DFA/NFA vocabulary
- states
- alphabet
- transition function
- accepted language
- string execution

## Phase 1 — NFA/ε-NFA
- NFA
- ε-NFA
- epsilon closure
- subset construction
- NFA → DFA

## Phase 2 — DFA Minimization
- equivalent states
- distinguishability
- partition method
- minimized automaton

## Phase 3 — Regular Expressions
- language → RE
- precedence
- union
- concatenation
- Kleene star
- RE → FA
- FA → RE

## Phase 4 — Equivalence + 2DFA
- NFA/DFA language equivalence
- equivalent automata
- two-way head movement

## Phase 5 — Moore/Mealy
- output machines
- transition/output distinction
- conversions
- equivalence

## Phase 6 — CFG
- variables
- terminals
- productions
- derivations
- parse/derivation trees
- ambiguity

## Phase 7 — CFG Simplification
- nullable variables
- null productions
- unit productions
- useless symbols

## Phase 8 — CNF
- CNF definition
- terminal replacement
- binary productions
- cleanup
- complete conversion

---

# Exam Mode

Exam Mode removes:
- tutorial explanations
- unlimited hints
- solution previews
- excessive animations

It keeps:
- timer
- question
- answer workspace
- transition table
- graph editor
- final answer submission

Question distribution must cover every FT-2 topic.

No topic should be silently omitted.

---

# Mastery

Each topic receives:
- concept score
- construction score
- execution score
- conversion score
- exam score

Mastery = all required skill dimensions above threshold.

Never mark a student "mastered" simply because they answered MCQs.

---

# Completion Definition

The project is complete when the learner can:

- construct DFA/NFA/ε-NFA
- simulate strings
- perform NFA → DFA conversion
- minimize DFA
- construct REs from languages
- perform RE → FA
- perform FA → RE
- reason about NFA/DFA equivalence
- simulate 2DFA
- explain and convert Moore/Mealy
- construct CFG
- generate derivation trees
- identify ambiguity
- simplify CFG
- convert CFG to CNF
- complete exam-style problems independently.
