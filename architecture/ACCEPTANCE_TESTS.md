# Acceptance Tests

## DFA

- Create q0, q1.
- Mark q0 start.
- Mark q1 accepting.
- Add transitions.
- Enter `01`.
- Simulator highlights states in order.
- Result is correct.

## NFA

- Allow multiple destinations for one symbol.
- Simulator tracks active state set.
- Accept if any active path reaches final.

## ε-NFA

- Epsilon closure is visible.
- Initial closure is applied before input.
- Closure is applied after each symbol move.

## NFA → DFA

Input NFA:
q0 --0--> q0,q1
q0 --1--> q0
q1 --0--> q1
q1 --1--> q0

System generates subset states and table.

## Minimization

Given a DFA with equivalent states:
- initial partition appears
- refinement splits groups
- equivalent states merge
- minimized machine accepts same test strings

## RE

Expression parser must respect:
star > concatenation > union.

Equivalent expressions should not be rejected merely because text differs.

## RE → FA

- symbol fragment works
- union works
- concatenation works
- star works

## FA → RE

State elimination produces an RE.
Result is testable against the original FA.

## 2DFA

Head can move left and right.
Boundary behavior is defined.

## Moore/Mealy

Output generation is deterministic.
Conversions preserve output behavior under the chosen convention.

## CFG

- production application works
- leftmost derivation checks leftmost variable
- rightmost derivation checks rightmost variable
- tree reflects derivation

## Ambiguity

System can display two distinct derivation trees for a witness.

## Simplification

Null, unit, and useless elimination each have independent tests.

## CNF

Every resulting production obeys the adopted CNF convention.

## Exam

- timer works
- no accidental tutorial reveal
- answers are validated
- score and topic breakdown appear
