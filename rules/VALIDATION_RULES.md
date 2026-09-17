# Mathematical Validation Rules

## DFA

For every state q and alphabet symbol a:
- exactly one destination
- no epsilon transition

## NFA

For q,a:
- zero or more destinations allowed.

## ε-NFA

For q, ε:
- zero or more destinations allowed.

## Acceptance

DFA:
Run one path.

NFA:
Accept if at least one path ends in an accepting state after consuming all input.

ε-NFA:
Include epsilon reachability throughout execution.

## NFA → DFA

Given subset T and symbol a:

D = ε-closure(move(T, a))

For an NFA without ε:
D = move(T, a)

DFA accepting subset:
Any subset containing at least one NFA accepting state.

## DFA Minimization

Before partition refinement:
remove unreachable states.

Initial partition:
{F, Q-F}

Refine until no group can be split.

States in the same final partition are equivalent.

## RE

Operators:
- union
- concatenation
- Kleene star

Precedence should be explicit:
1. star
2. concatenation
3. union

Do not assume two textual REs are different languages.

## Moore

Output is attached to a state.

## Mealy

Output is attached to a transition.

## CFG

Grammar:
G = (V, Σ, P, S)

Variables: V
Terminals: Σ
Productions: P
Start symbol: S

## Derivation

A derivation step replaces one occurrence of a variable using a production.

Leftmost:
always expand the leftmost variable.

Rightmost:
always expand the rightmost variable.

## Ambiguity

A grammar is ambiguous if there exists a string with more than one distinct parse tree.

## Null Productions

Null production:
A → ε

Compute nullable variables before constructing replacements.

If start symbol can derive ε, preserve this using an appropriate new start symbol according to the course convention.

## Unit Productions

Unit:
A → B

Replace unit chains by corresponding non-unit productions.

## Useless Symbols

A symbol is useless if it is:
- non-generating, or
- unreachable

## CNF

Allowed forms:
A → BC
A → a

Optionally:
S → ε
if ε belongs to the language, depending on the adopted convention.

No RHS of length > 2.
No mixed terminal/nonterminal RHS such as A → aB.
No unit productions.
No null productions except permitted start epsilon.
