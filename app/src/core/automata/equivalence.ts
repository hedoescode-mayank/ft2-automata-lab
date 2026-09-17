import type { Automaton } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Product Construction for DFA Equivalence
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductState {
  idA: string; // state ID in DFA A
  idB: string; // state ID in DFA B
  key: string; // canonical "(idA,idB)"
}

export interface ProductResult {
  /** All reachable product states */
  reachable: ProductState[];
  /** All product transitions: { from: key, symbol, to: key } */
  transitions: Array<{ from: string; symbol: string; to: string }>;
  /** First found distinguishing state, if any */
  distinguishingState: ProductState | null;
  /** Shortest distinguishing string (BFS path to distinguishingState) */
  distinguishingString: string | null;
  /** Are the two DFAs equivalent? */
  equivalent: boolean;
}

const productKey = (a: string, b: string) => `(${a},${b})`;

/**
 * Product construction of two DFAs.
 * Finds any reachable state where one component is accepting and the other is not.
 * Returns the shortest distinguishing string via BFS.
 */
export const productConstruction = (dfaA: Automaton, dfaB: Automaton): ProductResult => {
  const startA = dfaA.states.find(s => s.initial)?.id;
  const startB = dfaB.states.find(s => s.initial)?.id;

  if (!startA || !startB) {
    return {
      reachable: [],
      transitions: [],
      distinguishingState: null,
      distinguishingString: null,
      equivalent: true,
    };
  }

  // Shared alphabet
  const alphabet = [...new Set([...dfaA.alphabet, ...dfaB.alphabet])].filter(s => s !== 'ε');

  // BFS
  const visited  = new Map<string, ProductState>();
  // parent map for path reconstruction
  const parent   = new Map<string, { fromKey: string; symbol: string }>();
  const queue: ProductState[] = [];

  const addState = (a: string, b: string): ProductState => {
    const key = productKey(a, b);
    if (!visited.has(key)) {
      const ps: ProductState = { idA: a, idB: b, key };
      visited.set(key, ps);
      queue.push(ps);
    }
    return visited.get(key)!;
  };

  addState(startA, startB);

  const transitions: Array<{ from: string; symbol: string; to: string }> = [];
  let distinguishingState: ProductState | null = null;

  const acceptingA = new Set(dfaA.states.filter(s => s.accepting).map(s => s.id));
  const acceptingB = new Set(dfaB.states.filter(s => s.accepting).map(s => s.id));

  // Helper: get DFA transition
  const deltaA = (from: string, sym: string): string | null =>
    dfaA.transitions.find(t => t.from === from && t.symbols.includes(sym))?.to ?? null;
  const deltaB = (from: string, sym: string): string | null =>
    dfaB.transitions.find(t => t.from === from && t.symbols.includes(sym))?.to ?? null;

  while (queue.length > 0) {
    const cur = queue.shift()!;

    // Check if this is a distinguishing state (one accepts, other doesn't)
    const aAccepts = acceptingA.has(cur.idA);
    const bAccepts = acceptingB.has(cur.idB);
    if (aAccepts !== bAccepts && distinguishingState === null) {
      distinguishingState = cur;
    }

    // Explore transitions
    for (const sym of alphabet) {
      const nextA = deltaA(cur.idA, sym);
      const nextB = deltaB(cur.idB, sym);

      // Use dead state if no transition (∅ state)
      const na = nextA ?? `∅A`;
      const nb = nextB ?? `∅B`;

      const next = addState(na, nb);
      transitions.push({ from: cur.key, symbol: sym, to: next.key });

      if (!parent.has(next.key)) {
        parent.set(next.key, { fromKey: cur.key, symbol: sym });
      }
    }
  }

  // Reconstruct distinguishing string via BFS parent chain
  let distinguishingString: string | null = null;
  if (distinguishingState) {
    const path: string[] = [];
    let cur = distinguishingState.key;
    while (parent.has(cur)) {
      const { fromKey, symbol } = parent.get(cur)!;
      path.unshift(symbol);
      cur = fromKey;
    }
    distinguishingString = path.join('');
  }

  return {
    reachable: [...visited.values()],
    transitions,
    distinguishingState,
    distinguishingString,
    equivalent: distinguishingState === null,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// State labels for display
// ─────────────────────────────────────────────────────────────────────────────

export const formatProductState = (
  ps: ProductState,
  dfaA: Automaton,
  dfaB: Automaton
): string => {
  const la = dfaA.states.find(s => s.id === ps.idA)?.label ?? ps.idA;
  const lb = dfaB.states.find(s => s.id === ps.idB)?.label ?? ps.idB;
  return `(${la}, ${lb})`;
};
