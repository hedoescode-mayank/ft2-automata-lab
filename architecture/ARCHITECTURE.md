# Technical Architecture

## Recommended Stack

- React + TypeScript
- Vite
- Three.js
- @react-three/fiber
- @react-three/drei
- Zustand
- Tailwind CSS
- Lucide icons
- Vitest
- Playwright
- KaTeX or MathJax for mathematical notation

Do not overuse 3D. Mathematical diagrams should remain readable.

## Layers

### 1. Domain Engine

`src/core/`

Pure TypeScript.

Modules:
- automata/
- regex/
- grammar/
- minimization/
- equivalence/
- machines/
- validation/

No React imports.
No Three.js imports.

### 2. State Store

`src/store/`

Stores:
- current lesson
- current automaton
- current grammar
- current activity
- progress
- XP
- hints
- mistakes

### 3. Renderer

`src/components/scene/`

Three.js visualization:
- StateNode
- TransitionEdge
- Tape
- MachineHead
- GrammarNode
- ProductionCard
- PartitionGroup

### 4. 2D UI

`src/components/ui/`

- lesson panel
- instruction panel
- transition table
- inspector
- activity panel
- progress
- hints
- score

### 5. Content

`src/content/`

Lesson and activity JSON/TS data.

Keep educational content out of components.

---

# Data Models

## Automaton

```ts
type AutomatonType = "DFA" | "NFA" | "ENFA" | "TWO_WAY";

interface State {
  id: string;
  label: string;
  x: number;
  y: number;
  z?: number;
  initial: boolean;
  accepting: boolean;
}

interface Transition {
  id: string;
  from: string;
  to: string;
  symbols: string[];
}

interface Automaton {
  type: AutomatonType;
  alphabet: string[];
  states: State[];
  transitions: Transition[];
  initialState: string;
}
```

## Moore

```ts
interface MooreState extends State {
  output: string;
}
```

## Mealy

```ts
interface MealyTransition extends Transition {
  output: string;
}
```

## CFG

```ts
interface Grammar {
  variables: string[];
  terminals: string[];
  productions: {
    lhs: string;
    rhs: string[][];
  }[];
  startSymbol: string;
}
```

---

# Engine APIs

Implement pure functions:

```ts
epsilonClosure(states, automaton)
move(states, symbol, automaton)
nfaToDfa(nfa)
removeUnreachableStates(dfa)
minimizeDfa(dfa)
accepts(automaton, input)
equivalentAutomata(a, b)
regexToEnfa(regex)
faToRegex(fa)
simulateTwoWayFA(machine, input)
generateLeftmostDerivation(grammar, target)
generateRightmostDerivation(grammar, target)
isAmbiguousOnWitness(grammar, witness)
removeNullProductions(grammar)
removeUnitProductions(grammar)
removeUselessSymbols(grammar)
toCNF(grammar)
```

All algorithms need unit tests.

---

# Canonical Validation

For automata, do not compare raw state names.

Canonicalize or test language equivalence.

For RE:
Compile both expressions to automata and compare languages on a rigorous bounded basis plus structural normalization where practical.

For CFG/CNF:
Validate structural requirements and test bounded generated strings. Clearly label bounded validation as such.

---

# Persistence

MVP:
- localStorage

Optional:
- IndexedDB for larger progress/session data

Save:
- completed lessons
- scores
- XP
- unlocked zones
- current projects
- custom automata
- custom grammars

---

# Accessibility

Provide:
- 2D mode
- keyboard movement
- keyboard edge creation alternative
- high contrast
- reduced motion option
- screen-reader labels for controls
- text equivalent for every 3D tutorial

3D is optional enhancement, never the only interface.
