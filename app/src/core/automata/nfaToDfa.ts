import type { Automaton, State, Transition } from './types';
import { epsilonClosure, move } from './simulation';

/** Canonical key for a subset of state IDs */
export const subsetKey = (states: string[]): string =>
  [...states].sort().join(',') || '∅';

export interface SubsetStep {
  subset: string[];   // the current DFA state (set of NFA states)
  symbol: string;
  moveResult: string[];        // Move(subset, symbol) — raw
  closureResult: string[];     // ε-closure(moveResult) — final destination
}

export interface SubsetConstructionResult {
  dfa: Automaton;
  /** Map from DFA state ID → set of NFA state IDs it represents */
  dfaStateToNfaStates: Record<string, string[]>;
  /** Ordered steps taken during construction */
  steps: SubsetStep[];
}

/**
 * Full subset construction (also handles ENFA via ε-closure).
 * Returns the equivalent DFA plus metadata about how each DFA state was derived.
 */
export const subsetConstruction = (nfa: Automaton): SubsetConstructionResult => {
  const steps: SubsetStep[] = [];

  // Step 1: Compute the start subset
  const initials = nfa.states.filter(s => s.initial).map(s => s.id);
  const startSubset = nfa.type === 'ENFA' ? epsilonClosure(initials, nfa) : initials;

  // Maps subset key → DFA state ID
  const subsetToId: Record<string, string> = {};
  // Maps DFA state ID → NFA state set
  const dfaStateToNfaStates: Record<string, string[]> = {};

  const dfaStates: State[] = [];
  const dfaTransitions: Transition[] = [];
  const nfaAccepting = new Set(nfa.states.filter(s => s.accepting).map(s => s.id));

  let idCounter = 0;
  const getOrCreate = (subset: string[]): string => {
    const key = subsetKey(subset);
    if (subsetToId[key] !== undefined) return subsetToId[key];

    const newId = `D${idCounter++}`;
    subsetToId[key] = newId;
    dfaStateToNfaStates[newId] = subset;

    // Label: show NFA state labels (or ∅)
    const nfaLabelMap = Object.fromEntries(nfa.states.map(s => [s.id, s.label]));
    const label = subset.length === 0
      ? '∅'
      : '{' + subset.map(id => nfaLabelMap[id] ?? id).join(',') + '}';

    const isAccepting = subset.some(id => nfaAccepting.has(id));
    const isInitial = idCounter === 1; // first created is start

    // Rough layout: place DFA states in a grid
    const row = Math.floor((idCounter - 1) / 4);
    const col = (idCounter - 1) % 4;

    dfaStates.push({
      id: newId,
      label,
      x: 120 + col * 200,
      y: 100 + row * 130,
      initial: isInitial,
      accepting: isAccepting
    });

    return newId;
  };

  // BFS over subsets
  const queue: string[][] = [startSubset];
  getOrCreate(startSubset);
  const visited = new Set<string>([subsetKey(startSubset)]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentId = subsetToId[subsetKey(current)];

    for (const sym of nfa.alphabet) {
      if (sym === 'ε') continue;

      // Compute Move(current, sym)
      const moved = move(current, sym, nfa);
      // Apply ε-closure if ENFA
      const next = nfa.type === 'ENFA' ? epsilonClosure(moved, nfa) : moved;

      steps.push({ subset: current, symbol: sym, moveResult: moved, closureResult: next });

      const nextId = getOrCreate(next);
      dfaTransitions.push({
        id: `T${currentId}_${sym}`,
        from: currentId,
        to: nextId,
        symbols: [sym]
      });

      const nextKey = subsetKey(next);
      if (!visited.has(nextKey)) {
        visited.add(nextKey);
        queue.push(next);
      }
    }
  }

  const dfa: Automaton = {
    type: 'DFA',
    alphabet: nfa.alphabet.filter(s => s !== 'ε'),
    states: dfaStates,
    transitions: dfaTransitions,
    initialState: subsetToId[subsetKey(startSubset)] ?? null
  };

  return { dfa, dfaStateToNfaStates, steps };
};
