# Codex Build Prompt

You are building the FT-2 Interactive 3D Formal Languages & Automata learning platform.

FIRST:
1. Read PLAN.md completely.
2. Read content/CURRICULUM.md.
3. Read architecture/ARCHITECTURE.md.
4. Read rules/TEACHING_RULES.md.
5. Read rules/VALIDATION_RULES.md.
6. Read tasks/QUESTION_BANK.md.

Do not skip these files.

## Product Goal

Build a polished, highly interactive educational web app where FT-2 is taught through a 3D automata laboratory.

The user must be able to:
- drag states
- create/delete transitions
- mark start/final states
- enter strings
- simulate machines
- see transition tables generated live
- perform NFA → DFA conversion
- minimize DFAs
- construct and test regular expressions
- convert RE ↔ FA
- inspect equivalence
- operate a two-way finite automaton tape
- work with Moore/Mealy machines
- build CFGs
- perform derivations
- create derivation trees
- demonstrate ambiguity
- simplify CFGs
- convert grammars to CNF
- complete exam challenges

## Build Order

### Phase 1
Create the application shell and learning map.

### Phase 2
Implement the pure mathematical engine.

### Phase 3
Implement DFA/NFA editor and simulator.

### Phase 4
Implement ε-NFA and subset construction visualization.

### Phase 5
Implement DFA minimization workspace.

### Phase 6
Implement RE editor/tester and RE → FA.

### Phase 7
Implement FA → RE with GNFA/state elimination.

### Phase 8
Implement equivalence and 2DFA.

### Phase 9
Implement Moore/Mealy.

### Phase 10
Implement CFG editor, derivations and trees.

### Phase 11
Implement CFG simplification.

### Phase 12
Implement CNF factory.

### Phase 13
Implement exam mode and progress/mastery.

## Non-negotiable Engineering Constraints

1. Mathematical engine must be independent from UI and Three.js.
2. Every algorithm must have unit tests.
3. Do not compare automata by raw state IDs.
4. Use language equivalence/canonicalization where appropriate.
5. Support multiple correct regular expressions.
6. Keep 3D readable.
7. Provide a 2D fallback.
8. No fake validation.
9. Every activity must explain mistakes.
10. The FT-2 scope is exhaustive according to QUESTION_BANK.md.

## UX

Home:
"Automata Lab"

Dashboard:
- Unit 1 progress
- Unit 2 progress
- XP
- unlocked zones
- mastery map

Lesson screen:
- left: lesson/tutorial
- center: interactive 3D workspace
- right: inspector/table/hints
- bottom: activity controls

Do not make the user navigate through excessive menus.

## Visual Feedback

Correct:
- clear success state
- short explanation
- XP

Wrong:
- highlight exact invalid object
- explain the mathematical reason
- optionally provide a witness/counterexample

## 3D Design

Use Three.js where it adds value:
- state nodes
- transition arcs
- particles for active computation
- subset containers
- minimization partition groups
- grammar derivation objects
- CNF transformation factory

Use HTML/SVG for:
- labels
- equations
- tables
- text
- forms

## Deliverable

A working application, not a static mockup.

Before claiming completion:
- run tests
- manually verify each FT-2 topic
- verify string simulation
- verify transition table synchronization
- verify conversions
- verify CFG transformations
- verify exam mode
