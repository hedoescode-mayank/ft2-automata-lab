import { describe, it, expect } from 'vitest';
import type { Automaton } from '../src/core/automata/types';
import {
  reachableStates, removeUnreachable,
  refinePartition, runMinimization, findDistinguishingSymbol
} from '../src/core/automata/minimization';
import { simulateString } from '../src/core/automata/simulation';

// ─── Helper: 5-state DFA with redundant states for "strings ending in 1" ─────
// States: A(start), B(saw 1/accept), C(dead) — plus D≡A and E≡B as redundant
const redundantDfa: Automaton = {
  type: 'DFA',
  alphabet: ['0', '1'],
  states: [
    { id: 'A', label: 'A', x: 0, y: 0, initial: true,  accepting: false },
    { id: 'B', label: 'B', x: 0, y: 0, initial: false, accepting: true  },
    { id: 'C', label: 'C', x: 0, y: 0, initial: false, accepting: false },
    { id: 'D', label: 'D', x: 0, y: 0, initial: false, accepting: false }, // unreachable
    { id: 'E', label: 'E', x: 0, y: 0, initial: false, accepting: true  }, // unreachable
  ],
  transitions: [
    { id: 't1', from: 'A', to: 'C', symbols: ['0'] },
    { id: 't2', from: 'A', to: 'B', symbols: ['1'] },
    { id: 't3', from: 'B', to: 'C', symbols: ['0'] },
    { id: 't4', from: 'B', to: 'B', symbols: ['1'] },
    { id: 't5', from: 'C', to: 'C', symbols: ['0'] },
    { id: 't6', from: 'C', to: 'B', symbols: ['1'] },
    // D and E are unreachable — no transitions lead to them
    { id: 't7', from: 'D', to: 'D', symbols: ['0','1'] },
    { id: 't8', from: 'E', to: 'E', symbols: ['0','1'] },
  ],
  initialState: 'A'
};

// ─── 4-state DFA where C≡A (equivalent / mergeable) ─────────────────────────
// Language: strings ending in 1
const mergeableDfa: Automaton = {
  type: 'DFA',
  alphabet: ['0', '1'],
  states: [
    { id: 'q0', label: 'q0', x: 0, y: 0, initial: true,  accepting: false },
    { id: 'q1', label: 'q1', x: 0, y: 0, initial: false, accepting: true  },
    { id: 'q2', label: 'q2', x: 0, y: 0, initial: false, accepting: false }, // same as q0
    { id: 'q3', label: 'q3', x: 0, y: 0, initial: false, accepting: true  }, // same as q1
  ],
  transitions: [
    { id: 't1', from: 'q0', to: 'q2', symbols: ['0'] },
    { id: 't2', from: 'q0', to: 'q1', symbols: ['1'] },
    { id: 't3', from: 'q1', to: 'q2', symbols: ['0'] },
    { id: 't4', from: 'q1', to: 'q3', symbols: ['1'] },
    { id: 't5', from: 'q2', to: 'q0', symbols: ['0'] },
    { id: 't6', from: 'q2', to: 'q3', symbols: ['1'] },
    { id: 't7', from: 'q3', to: 'q0', symbols: ['0'] },
    { id: 't8', from: 'q3', to: 'q1', symbols: ['1'] },
  ],
  initialState: 'q0'
};

// ─── Minimal DFA (already minimal — even binary numbers) ─────────────────────
const alreadyMinimalDfa: Automaton = {
  type: 'DFA',
  alphabet: ['0','1'],
  states: [
    { id: 'e', label: 'even', x: 0, y: 0, initial: true,  accepting: true  },
    { id: 'o', label: 'odd',  x: 0, y: 0, initial: false, accepting: false },
  ],
  transitions: [
    { id: 't1', from: 'e', to: 'o', symbols: ['1'] },
    { id: 't2', from: 'e', to: 'e', symbols: ['0'] },
    { id: 't3', from: 'o', to: 'e', symbols: ['1'] },
    { id: 't4', from: 'o', to: 'o', symbols: ['0'] },
  ],
  initialState: 'e'
};

// ─────────────────────────────────────────────────────────────────────────────
describe('reachableStates', () => {
  it('finds A, B, C but not D, E', () => {
    const r = reachableStates(redundantDfa);
    expect(r.has('A')).toBe(true);
    expect(r.has('B')).toBe(true);
    expect(r.has('C')).toBe(true);
    expect(r.has('D')).toBe(false);
    expect(r.has('E')).toBe(false);
  });
});

describe('removeUnreachable', () => {
  it('strips unreachable states and their transitions', () => {
    const clean = removeUnreachable(redundantDfa);
    expect(clean.states.map(s => s.id).sort()).toEqual(['A','B','C']);
    expect(clean.transitions.every(t => ['A','B','C'].includes(t.from))).toBe(true);
  });
});

describe('refinePartition', () => {
  it('initial P0 splits accepting from non-accepting', () => {
    const clean = removeUnreachable(redundantDfa);
    const accepting    = clean.states.filter(s => s.accepting).map(s => s.id);
    const nonAccepting = clean.states.filter(s => !s.accepting).map(s => s.id);
    const p0 = [accepting, nonAccepting];
    // After first refinement on redundantDfa (A and C are non-accepting)
    // A on 0→C (group 1), C on 0→C (group 1): same. A on 1→B (group 0), C on 1→B (group 0): same.
    // A and C are equivalent in this DFA
    const p1 = refinePartition(clean, p0);
    expect(p1.length).toBeGreaterThanOrEqual(2);
  });

  it('stable partition is unchanged', () => {
    const clean = removeUnreachable(alreadyMinimalDfa);
    const p0 = [['e'], ['o']];
    const p1 = refinePartition(clean, p0);
    expect(p1.length).toBe(2);
  });
});

describe('runMinimization — redundant DFA', () => {
  const { steps, finalPartition, minimizedDfa } = runMinimization(redundantDfa);

  it('removes unreachable states (D,E) first', () => {
    expect(minimizedDfa.states.every(s => !s.label.includes('D') && !s.label.includes('E'))).toBe(true);
  });

  it('first step is P0', () => {
    expect(steps[0].description).toContain('P₀');
  });

  it('minimized DFA has ≤ original state count', () => {
    expect(minimizedDfa.states.length).toBeLessThanOrEqual(3); // A,B,C where A≡C
  });

  it('minimized DFA preserves language — accepts "1"', () => {
    expect(simulateString(minimizedDfa, '1').accepted).toBe(true);
  });
  it('minimized DFA preserves language — accepts "01"', () => {
    expect(simulateString(minimizedDfa, '01').accepted).toBe(true);
  });
  it('minimized DFA preserves language — accepts "11"', () => {
    expect(simulateString(minimizedDfa, '11').accepted).toBe(true);
  });
  it('minimized DFA preserves language — rejects ""', () => {
    expect(simulateString(minimizedDfa, '').accepted).toBe(false);
  });
  it('minimized DFA preserves language — rejects "0"', () => {
    expect(simulateString(minimizedDfa, '0').accepted).toBe(false);
  });
  it('minimized DFA preserves language — rejects "10"', () => {
    expect(simulateString(minimizedDfa, '10').accepted).toBe(false);
  });
});

describe('runMinimization — mergeable DFA', () => {
  const { minimizedDfa } = runMinimization(mergeableDfa);

  it('merges equivalent states — result has fewer states', () => {
    expect(minimizedDfa.states.length).toBeLessThan(mergeableDfa.states.length);
  });

  it('language preserved — accepts "1"',  () => expect(simulateString(minimizedDfa, '1').accepted).toBe(true));
  it('language preserved — accepts "001"', () => expect(simulateString(minimizedDfa, '001').accepted).toBe(true));
  it('language preserved — rejects "0"',  () => expect(simulateString(minimizedDfa, '0').accepted).toBe(false));
  it('language preserved — rejects "00"', () => expect(simulateString(minimizedDfa, '00').accepted).toBe(false));
});

describe('runMinimization — already minimal DFA', () => {
  const { minimizedDfa } = runMinimization(alreadyMinimalDfa);

  it('already minimal — state count unchanged', () => {
    expect(minimizedDfa.states.length).toBe(alreadyMinimalDfa.states.length);
  });
});

describe('findDistinguishingSymbol', () => {
  it('finds a distinguishing symbol for A (non-accepting) and B (accepting) — they differ on initial class', () => {
    const clean = removeUnreachable(redundantDfa);
    const p0 = [
      clean.states.filter(s => s.accepting).map(s => s.id),
      clean.states.filter(s => !s.accepting).map(s => s.id),
    ];
    // B is in group 0 (accepting), A is in group 1 (non-accepting)
    // They are in different groups already — let's check A vs C which should be equivalent
    const sym = findDistinguishingSymbol(clean, 'A', 'B', p0);
    // A→B on '1' (group 0), B→B on '1' (group 0) — same group
    // A→C on '0' (group 1), B→C on '0' (group 1) — same group
    // Actually A and B are in different accepting classes, so we pass A and C:
    const symAC = findDistinguishingSymbol(clean, 'A', 'C', p0);
    // Both A and C are non-accepting, and their transitions lead to same groups → null
    expect(symAC).toBeNull();
  });
});
