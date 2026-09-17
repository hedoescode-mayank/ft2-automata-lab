import type { RegexNode } from './ast';
import type { Automaton, State, Transition } from '../automata/types';

// ─── Thompson's Construction ─────────────────────────────────────────────────
// Each call to buildFragment() returns a small ε-NFA fragment with:
//   - exactly one start state  (startId)
//   - exactly one accept state (acceptId)
// Fragments are combined via ε-connections.

let _stateCounter = 0;
const newId = () => `s${_stateCounter++}`;

export const resetCounter = () => { _stateCounter = 0; };

interface Fragment {
  startId: string;
  acceptId: string;
  states: State[];
  transitions: Transition[];
}

const makeState = (id: string, x = 0, y = 0, initial = false, accepting = false): State =>
  ({ id, label: id, x, y, initial, accepting });

const makeTransition = (from: string, to: string, symbols: string[]): Transition =>
  ({ id: `t_${from}_${to}_${symbols.join('_')}`, from, to, symbols });

// ── Primitive fragments ──────────────────────────────────────────────────────

const fragmentChar = (ch: string): Fragment => {
  const s = newId(), a = newId();
  return {
    startId: s, acceptId: a,
    states: [makeState(s), makeState(a)],
    transitions: [makeTransition(s, a, [ch])],
  };
};

const fragmentEpsilon = (): Fragment => {
  const s = newId(), a = newId();
  return {
    startId: s, acceptId: a,
    states: [makeState(s), makeState(a)],
    transitions: [makeTransition(s, a, ['ε'])],
  };
};

const fragmentEmpty = (): Fragment => {
  // Language ∅: two states, no transitions
  const s = newId(), a = newId();
  return {
    startId: s, acceptId: a,
    states: [makeState(s), makeState(a)],
    transitions: [],
  };
};

// ── Composite fragments ──────────────────────────────────────────────────────

const fragmentUnion = (f1: Fragment, f2: Fragment): Fragment => {
  const s = newId(), a = newId();
  return {
    startId: s, acceptId: a,
    states: [...f1.states, ...f2.states, makeState(s), makeState(a)],
    transitions: [
      ...f1.transitions, ...f2.transitions,
      makeTransition(s, f1.startId, ['ε']),
      makeTransition(s, f2.startId, ['ε']),
      makeTransition(f1.acceptId, a, ['ε']),
      makeTransition(f2.acceptId, a, ['ε']),
    ],
  };
};

const fragmentConcat = (f1: Fragment, f2: Fragment): Fragment => ({
  startId: f1.startId,
  acceptId: f2.acceptId,
  states: [...f1.states, ...f2.states],
  transitions: [
    ...f1.transitions, ...f2.transitions,
    makeTransition(f1.acceptId, f2.startId, ['ε']),
  ],
});

const fragmentStar = (f: Fragment): Fragment => {
  const s = newId(), a = newId();
  return {
    startId: s, acceptId: a,
    states: [...f.states, makeState(s), makeState(a)],
    transitions: [
      ...f.transitions,
      makeTransition(s, f.startId, ['ε']),     // enter
      makeTransition(s, a, ['ε']),              // skip (zero times)
      makeTransition(f.acceptId, f.startId, ['ε']), // loop
      makeTransition(f.acceptId, a, ['ε']),    // exit
    ],
  };
};

const fragmentPlus = (f: Fragment): Fragment => {
  // R+ = R · R*
  // We need a copy — instead we build: enter fragment, then loop back
  const a = newId();
  return {
    startId: f.startId,
    acceptId: a,
    states: [...f.states, makeState(a)],
    transitions: [
      ...f.transitions,
      makeTransition(f.acceptId, f.startId, ['ε']), // loop
      makeTransition(f.acceptId, a, ['ε']),          // exit
    ],
  };
};

const fragmentQuestion = (f: Fragment): Fragment => {
  // R? = R | ε
  const s = newId(), a = newId();
  return {
    startId: s, acceptId: a,
    states: [...f.states, makeState(s), makeState(a)],
    transitions: [
      ...f.transitions,
      makeTransition(s, f.startId, ['ε']),  // take R
      makeTransition(s, a, ['ε']),           // skip R (ε case)
      makeTransition(f.acceptId, a, ['ε']), // exit from R
    ],
  };
};

// ── Main recursive builder ───────────────────────────────────────────────────

const buildFragment = (node: RegexNode): Fragment => {
  switch (node.type) {
    case 'Char':     return fragmentChar(node.value!);
    case 'Epsilon':  return fragmentEpsilon();
    case 'Empty':    return fragmentEmpty();
    case 'Union':    return fragmentUnion(buildFragment(node.left!), buildFragment(node.right!));
    case 'Concat':   return fragmentConcat(buildFragment(node.left!), buildFragment(node.right!));
    case 'Star':     return fragmentStar(buildFragment(node.child!));
    case 'Plus':     return fragmentPlus(buildFragment(node.child!));
    case 'Question': return fragmentQuestion(buildFragment(node.child!));
  }
};

// ── Layout helper: position states in a grid ─────────────────────────────────
const layoutStates = (states: State[]): State[] => {
  const cols = 5;
  return states.map((state, i) => ({
    ...state,
    x: 80 + (i % cols) * 130,
    y: 60 + Math.floor(i / cols) * 110,
  }));
};

// ── Public API ───────────────────────────────────────────────────────────────

export interface ThompsonResult {
  enfa: Automaton;
  /** The start and accept state IDs of the outermost fragment */
  startId: string;
  acceptId: string;
}

export const thompsonConstruct = (ast: RegexNode): ThompsonResult => {
  resetCounter();

  const fragment = buildFragment(ast);

  // Collect all alphabet symbols (excluding ε)
  const alphabetSet = new Set<string>();
  for (const t of fragment.transitions) {
    for (const sym of t.symbols) {
      if (sym !== 'ε') alphabetSet.add(sym);
    }
  }

  // Mark start and accept states
  const states = layoutStates(fragment.states.map(s => ({
    ...s,
    initial:   s.id === fragment.startId,
    accepting: s.id === fragment.acceptId,
    label: s.id === fragment.startId ? 'start' : s.id === fragment.acceptId ? 'accept' : s.id,
  })));

  const enfa: Automaton = {
    type: 'ENFA',
    alphabet: [...alphabetSet, 'ε'],
    states,
    transitions: fragment.transitions.map((t, i) => ({ ...t, id: `T${i}` })),
    initialState: fragment.startId,
  };

  return { enfa, startId: fragment.startId, acceptId: fragment.acceptId };
};

// ─── Test a string against a regex AST via Thompson + simulation ─────────────
import { simulateString } from '../automata/simulation';

export const testRegex = (ast: RegexNode, input: string): boolean => {
  const { enfa } = thompsonConstruct(ast);
  return simulateString(enfa, input).accepted;
};
