import type { Automaton, State, Transition } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** IDs of states reachable from the initial state by BFS/DFS */
export const reachableStates = (dfa: Automaton): Set<string> => {
  const start = dfa.states.find(s => s.initial)?.id;
  if (!start) return new Set();

  const visited = new Set<string>([start]);
  const queue = [start];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const t of dfa.transitions) {
      if (t.from === cur && !visited.has(t.to)) {
        visited.add(t.to);
        queue.push(t.to);
      }
    }
  }
  return visited;
};

/** Remove unreachable states (and their transitions) from a DFA */
export const removeUnreachable = (dfa: Automaton): Automaton => {
  const reachable = reachableStates(dfa);
  return {
    ...dfa,
    states: dfa.states.filter(s => reachable.has(s.id)),
    transitions: dfa.transitions.filter(t => reachable.has(t.from) && reachable.has(t.to)),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Partition refinement
// ─────────────────────────────────────────────────────────────────────────────

/** A partition is an ordered list of groups; each group is a set of state IDs */
export type Partition = string[][];

/** Map state ID → which group index it belongs to */
const buildGroupMap = (partition: Partition): Record<string, number> => {
  const map: Record<string, number> = {};
  partition.forEach((group, gi) => group.forEach(id => { map[id] = gi; }));
  return map;
};

/** One refinement pass. Returns the new partition (may be same as input if stable). */
export const refinePartition = (
  dfa: Automaton,
  partition: Partition,
): Partition => {
  const groupOf = buildGroupMap(partition);
  const newPartition: Partition = [];

  for (const group of partition) {
    if (group.length === 1) {
      newPartition.push(group);
      continue;
    }

    // Split group by the signature: for each symbol, which group does the target belong to?
    const signature = (stateId: string): string =>
      dfa.alphabet.map(sym => {
        const t = dfa.transitions.find(tr => tr.from === stateId && tr.symbols.includes(sym));
        const dest = t?.to;
        // undefined / missing transition → group -1 (dead)
        return dest !== undefined ? String(groupOf[dest] ?? -1) : '-1';
      }).join('|');

    const buckets = new Map<string, string[]>();
    for (const stateId of group) {
      const sig = signature(stateId);
      if (!buckets.has(sig)) buckets.set(sig, []);
      buckets.get(sig)!.push(stateId);
    }

    for (const bucket of buckets.values()) {
      newPartition.push(bucket);
    }
  }

  return newPartition;
};

export interface MinimizationStep {
  description: string;
  partition: Partition;
  splitOccurred: boolean;
}

/** Run full partition refinement and record every step. */
export const runMinimization = (dfa: Automaton): {
  steps: MinimizationStep[];
  finalPartition: Partition;
  minimizedDfa: Automaton;
} => {
  // Step 1: remove unreachable
  const clean = removeUnreachable(dfa);

  const accepting    = new Set(clean.states.filter(s => s.accepting).map(s => s.id));
  const nonAccepting = new Set(clean.states.filter(s => !s.accepting).map(s => s.id));

  // Step 2: initial partition P0
  const p0: Partition = [];
  if (accepting.size > 0)    p0.push([...accepting]);
  if (nonAccepting.size > 0) p0.push([...nonAccepting]);

  const steps: MinimizationStep[] = [
    {
      description: 'Initial partition P₀: separate accepting (F) from non-accepting (Q − F)',
      partition: p0.map(g => [...g]),
      splitOccurred: false,
    }
  ];

  let current = p0;

  // Step 3: refine until stable
  for (let iter = 1; iter <= 50; iter++) {
    const next = refinePartition(clean, current);

    const changed = JSON.stringify(
      current.map(g => [...g].sort())
    ) !== JSON.stringify(
      next.map(g => [...g].sort())
    );

    steps.push({
      description: changed
        ? `Refinement step ${iter}: partition was split (some states are distinguishable)`
        : `Refinement step ${iter}: partition is stable — algorithm complete`,
      partition: next.map(g => [...g]),
      splitOccurred: changed,
    });

    current = next;
    if (!changed) break;
  }

  // Step 4: build minimized DFA
  const minimizedDfa = buildMinimizedDfa(clean, current);

  return { steps, finalPartition: current, minimizedDfa };
};

// ─────────────────────────────────────────────────────────────────────────────
// Build minimized DFA from final partition
// ─────────────────────────────────────────────────────────────────────────────

const buildMinimizedDfa = (dfa: Automaton, partition: Partition): Automaton => {
  const groupOf = buildGroupMap(partition);

  // Representative of each group: just the first element
  const representative = (gi: number) => partition[gi][0];

  const newStates: State[] = partition.map((group, gi) => {
    // Combine all labels in the group
    const labels = group
      .map(id => dfa.states.find(s => s.id === id)?.label ?? id)
      .join('/');
    const isInitial = group.some(id => dfa.states.find(s => s.id === id)?.initial);
    const isAccepting = group.some(id => dfa.states.find(s => s.id === id)?.accepting);

    return {
      id: `M${gi}`,
      label: labels,
      x: 120 + (gi % 4) * 200,
      y: 100 + Math.floor(gi / 4) * 130,
      initial: isInitial,
      accepting: isAccepting,
    };
  });

  const newTransitions: Transition[] = [];
  const seen = new Set<string>();

  for (let gi = 0; gi < partition.length; gi++) {
    const rep = representative(gi);
    for (const sym of dfa.alphabet) {
      const t = dfa.transitions.find(tr => tr.from === rep && tr.symbols.includes(sym));
      if (!t) continue;
      const destGroup = groupOf[t.to];
      const tKey = `M${gi}_${sym}`;
      if (seen.has(tKey)) continue;
      seen.add(tKey);
      newTransitions.push({
        id: `MT${gi}_${sym}`,
        from: `M${gi}`,
        to: `M${destGroup}`,
        symbols: [sym],
      });
    }
  }

  const initGroup = partition.findIndex(group =>
    group.some(id => dfa.states.find(s => s.id === id)?.initial)
  );

  return {
    type: 'DFA',
    alphabet: dfa.alphabet,
    states: newStates,
    transitions: newTransitions,
    initialState: initGroup >= 0 ? `M${initGroup}` : null,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Distinguishability check (for feedback)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return the symbol (if any) that distinguishes two states.
 * If none found at depth 1, returns null.
 */
export const findDistinguishingSymbol = (
  dfa: Automaton,
  s1: string,
  s2: string,
  partition: Partition,
): string | null => {
  const groupOf = buildGroupMap(partition);
  for (const sym of dfa.alphabet) {
    const t1 = dfa.transitions.find(t => t.from === s1 && t.symbols.includes(sym))?.to;
    const t2 = dfa.transitions.find(t => t.from === s2 && t.symbols.includes(sym))?.to;
    const g1 = t1 !== undefined ? (groupOf[t1] ?? -1) : -2;
    const g2 = t2 !== undefined ? (groupOf[t2] ?? -1) : -2;
    if (g1 !== g2) return sym;
  }
  return null;
};
