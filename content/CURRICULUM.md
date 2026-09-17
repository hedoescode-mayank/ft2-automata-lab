# FT-2 Curriculum

## UNIT 1

### 1. NFA → DFA

Must teach:
- deterministic vs nondeterministic transition
- subset construction
- DFA states as sets of NFA states
- start subset
- accepting subsets
- reachable-state reduction
- transition table generation

Worked example:
NFA:
- q0 start
- q1 final
- q0 --0--> q0,q1
- q0 --1--> q0

Language intuition: strings containing at least one 0.

Interactive:
User draws NFA, clicks "Convert", and the system generates DFA subset states.

Challenge:
"Convert this NFA to DFA using subset construction."

Validation:
Compare canonicalized transition functions and accepting states, allowing equivalent state naming.

---

### 2. ε-NFA → DFA

Must teach:
- epsilon closure
- closure before consuming input
- closure after consuming input
- subset construction with closures

Animation:
Show tokens flowing through ε edges before/after each symbol.

Challenge:
Calculate:
ε-closure(q0)
Move(T,a)
ε-closure(Move(T,a))

Then build the resulting DFA.

Common mistakes:
- forgetting epsilon closure at start
- forgetting closure after a move
- treating ε as input
- incorrect accepting subset identification

---

### 3. DFA Minimization

Teach:
- unreachable state removal
- final/non-final initial partition
- distinguishability
- refinement
- equivalent states
- merged states

Interactive:
States appear in partition boxes.
User drags states between groups.
System highlights distinguishing strings when available.

Exam workflow:
1. Remove unreachable states.
2. Create P0 = {F, Q-F}.
3. Refine partitions based on transitions.
4. Repeat until stable.
5. Merge equivalent states.
6. Draw minimized DFA.

---

### 4. Regular Expressions for Given Languages

Teach:
- ∅
- ε
- symbols
- union (+ / |)
- concatenation
- Kleene star
- parentheses
- precedence

Examples:
- strings over {0,1} ending in 01
- strings containing 101
- strings with an even number of 0s
- strings beginning with 1 and ending with 0
- all strings over {a,b} containing at least one a

Important:
The system should test the student's RE against generated strings rather than rely only on textual equality.

Because multiple REs can describe the same language.

---

### 5. RE → FA

Teach Thompson-style construction:
- symbol
- union
- concatenation
- star

Show construction tree:
RE → fragments → ε-NFA.

Activity:
User selects RE.
System generates construction stages.
User completes missing transitions.

Advanced:
Allow optional ε-NFA → DFA.

---

### 6. FA → RE

Teach state elimination:
1. Add new start state.
2. Add new final state.
3. Eliminate states systematically.
4. Update edge labels with REs.
5. Finish with one RE from start to final.

Also teach GNFA concept.

Activity:
Drag an intermediate state into an elimination bin.
The engine previews updated RE labels.

Must explain:
R_ij = R_ij + R_ik(R_kk)*R_kj

Use consistent notation.

---

### 7. NFA/DFA Equivalence

Teach:
- same language vs same structure
- NFA can have multiple paths
- DFA has one path
- subset construction establishes equivalence
- equivalent automata can have different numbers of states

Activity:
Give an NFA and DFA.
Ask:
"Are they equivalent?"
Then provide distinguishing string if not.

---

### 8. Two-Way Finite Automata

Teach:
- head moves Left/Right
- input boundaries
- difference from ordinary FA
- transition depends on state + scanned symbol
- acceptance/rejection

Interactive tape:
[⊢][a][b][a][b][⊣]

Head visibly moves.

Challenge:
Trace the machine on an input.

---

### 9. Moore and Mealy Machines

Teach:
Moore:
output associated with state.

Mealy:
output associated with transition.

Visual:
Moore:
q0 / 0

Mealy:
q0 --a/1--> q1

Teach:
- construction
- output generation
- timing of output
- state splitting during conversion
- conversion Moore ↔ Mealy
- equivalence of output behavior

Activity:
Given one machine, construct the other.

---

## UNIT 2

### 10. CFG

Teach:
G = (V, Σ, P, S)

Explain:
- variables/nonterminals
- terminals
- productions
- start symbol
- language generated

Example:
S → aSb | ε

Interactive:
User clicks symbols to apply productions.

---

### 11. Derivations and Derivation Trees

Teach:
- sentential form
- leftmost derivation
- rightmost derivation
- parse/derivation tree

Activity:
Target string appears at bottom.
User chooses productions to derive it.

Validation:
Check every derivation step.

---

### 12. Ambiguous vs Unambiguous Grammar

Teach:
A grammar is ambiguous if some string has more than one distinct parse tree (equivalently, more than one leftmost/rightmost derivation).

Classic example:
E → E + E | E * E | id

Activity:
Find two distinct derivation trees for id + id * id.

Then show an unambiguous expression grammar using precedence.

---

### 13. Useless Symbol Elimination

Teach two properties:
1. generating/productive
2. reachable

Recommended algorithm:
- remove non-generating symbols
- then remove unreachable symbols

Activity:
Color:
- green = useful
- red = useless
- gray = unreachable

Challenge:
Simplify the grammar.

---

### 14. Null Production Elimination

Teach:
A → ε is a null production.

Need:
- identify nullable variables
- compute nullable set
- create required alternatives
- remove ε-productions
- preserve language appropriately
- special treatment for start symbol

Interactive:
System highlights nullable variables.
User checks/unchecks generated alternatives.

---

### 15. Unit Production Elimination

Teach:
A → B is a unit production.

Compute unit pairs/reachability.
Replace unit chains with non-unit productions.
Remove unit productions.

Activity:
Given:
S → A
A → B
B → b | c
User must produce:
S → b | c
A → b | c

Then combine with other simplification steps.

---

### 16. CNF

Definition:
A CFG is in CNF if productions have form:
A → BC
A → a
and optionally S → ε when ε belongs to the language, depending on convention.

Teach conversion pipeline:
1. Add new start symbol if needed.
2. Remove ε-productions.
3. Remove unit productions.
4. Remove useless symbols.
5. Replace terminals in long RHS.
6. Break RHS longer than 2 into binary productions.

Example:
A → aBC
becomes:
A → X_a C1
C1 → BC
X_a → a

Activity:
Drag productions through a "CNF factory" with stages.

Validation:
Check structural CNF constraints and language preservation on bounded test strings.

---

# Topic Dependency Graph

DFA basics
→ NFA
→ ε-NFA
→ NFA→DFA
→ equivalence
→ minimization

Regex basics
→ RE→FA
→ FA→RE

FA concepts
→ 2DFA

Output automata
→ Moore/Mealy
→ conversions
→ equivalence

CFG basics
→ derivation
→ derivation trees
→ ambiguity

CFG
→ nullable/unit/useless cleanup
→ CNF
