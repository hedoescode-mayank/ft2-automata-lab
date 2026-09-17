import { describe, it, expect } from 'vitest';
import type { Automaton } from '../src/core/automata/types';
import { productConstruction } from '../src/core/automata/equivalence';

// ─── DFA A: Accepts strings with even number of 1s (minimal) ─────────────
const evenOnesA: Automaton = {
  type: 'DFA',
  alphabet: ['0', '1'],
  states: [
    { id: 'q0', label: 'Even', x: 0, y: 0, initial: true,  accepting: true  },
    { id: 'q1', label: 'Odd',  x: 0, y: 0, initial: false, accepting: false },
  ],
  transitions: [
    { id: 't1', from: 'q0', to: 'q0', symbols: ['0'] },
    { id: 't2', from: 'q0', to: 'q1', symbols: ['1'] },
    { id: 't3', from: 'q1', to: 'q1', symbols: ['0'] },
    { id: 't4', from: 'q1', to: 'q0', symbols: ['1'] },
  ],
  initialState: 'q0'
};

// ─── DFA B: Equivalent to A but with redundant states ────────────────────
const evenOnesB: Automaton = {
  type: 'DFA',
  alphabet: ['0', '1'],
  states: [
    { id: 'A', label: 'Start (Even)', x: 0, y: 0, initial: true,  accepting: true  },
    { id: 'B', label: 'Odd1',         x: 0, y: 0, initial: false, accepting: false },
    { id: 'C', label: 'Even2',        x: 0, y: 0, initial: false, accepting: true  },
    { id: 'D', label: 'Odd2',         x: 0, y: 0, initial: false, accepting: false },
  ],
  transitions: [
    { id: 't1', from: 'A', to: 'A', symbols: ['0'] },
    { id: 't2', from: 'A', to: 'B', symbols: ['1'] },
    { id: 't3', from: 'B', to: 'B', symbols: ['0'] },
    { id: 't4', from: 'B', to: 'C', symbols: ['1'] },
    { id: 't5', from: 'C', to: 'C', symbols: ['0'] },
    { id: 't6', from: 'C', to: 'D', symbols: ['1'] },
    { id: 't7', from: 'D', to: 'D', symbols: ['0'] },
    { id: 't8', from: 'D', to: 'A', symbols: ['1'] },
  ],
  initialState: 'A'
};

// ─── DFA C: Not equivalent (accepts strings with odd number of 1s) ───────
const oddOnes: Automaton = {
  type: 'DFA',
  alphabet: ['0', '1'],
  states: [
    { id: 's0', label: 'Even', x: 0, y: 0, initial: true,  accepting: false },
    { id: 's1', label: 'Odd',  x: 0, y: 0, initial: false, accepting: true  },
  ],
  transitions: [
    { id: 't1', from: 's0', to: 's0', symbols: ['0'] },
    { id: 't2', from: 's0', to: 's1', symbols: ['1'] },
    { id: 't3', from: 's1', to: 's1', symbols: ['0'] },
    { id: 't4', from: 's1', to: 's0', symbols: ['1'] },
  ],
  initialState: 's0'
};

// ─── DFA D: Not equivalent (accepts strings ending in 1) ─────────────────
const endsInOne: Automaton = {
  type: 'DFA',
  alphabet: ['0', '1'],
  states: [
    { id: 'p0', label: 'Start', x: 0, y: 0, initial: true,  accepting: false },
    { id: 'p1', label: 'Ends1', x: 0, y: 0, initial: false, accepting: true  },
  ],
  transitions: [
    { id: 't1', from: 'p0', to: 'p0', symbols: ['0'] },
    { id: 't2', from: 'p0', to: 'p1', symbols: ['1'] },
    { id: 't3', from: 'p1', to: 'p0', symbols: ['0'] },
    { id: 't4', from: 'p1', to: 'p1', symbols: ['1'] },
  ],
  initialState: 'p0'
};

describe('Product Construction for DFA Equivalence', () => {
  it('correctly identifies equivalent DFAs', () => {
    const result = productConstruction(evenOnesA, evenOnesB);
    expect(result.equivalent).toBe(true);
    expect(result.distinguishingState).toBeNull();
    expect(result.distinguishingString).toBeNull();
  });

  it('correctly identifies non-equivalent DFAs (Empty string distinguishes)', () => {
    const result = productConstruction(evenOnesA, oddOnes);
    expect(result.equivalent).toBe(false);
    // evenOnesA accepts empty string (initial state is accepting)
    // oddOnes rejects empty string (initial state is not accepting)
    expect(result.distinguishingState).toBeDefined();
    expect(result.distinguishingString).toBe('');
  });

  it('correctly identifies non-equivalent DFAs (Shortest string distinguishes)', () => {
    const result = productConstruction(evenOnesA, endsInOne);
    expect(result.equivalent).toBe(false);
    expect(result.distinguishingState).toBeDefined();
    // '1' is the shortest string: A ends up in 'q1' (reject), endsInOne ends up in 'p1' (accept)
    // Actually, empty string distinguishes them first! A accepts, D rejects.
    expect(result.distinguishingString).toBe('');
  });

  it('correctly identifies non-equivalent DFAs (Longer distinguishing string)', () => {
    // Modify A so it's not distinguishing on empty string, but later
    const aMod: Automaton = { ...evenOnesA, states: evenOnesA.states.map(s => ({ ...s, accepting: false })) };
    const bMod: Automaton = { ...endsInOne, states: endsInOne.states.map(s => ({ ...s, accepting: false })) };
    // Now both reject empty string.
    // Let's make aMod accept '11' (q0 -> q1 -> q0, if q0 is accept... wait, A is even 1s).
    // Let's manually set accepting states.
    // aMod: accepts nothing.
    // Let's just create a specific test case:
    const dfa1: Automaton = {
      type: 'DFA',
      alphabet: ['a', 'b'],
      states: [
        { id: '1', label: '1', x:0, y:0, initial: true, accepting: false },
        { id: '2', label: '2', x:0, y:0, initial: false, accepting: true },
        { id: '3', label: '3', x:0, y:0, initial: false, accepting: false }
      ],
      transitions: [
        { id: 't1', from: '1', to: '2', symbols: ['a'] },
        { id: 't2', from: '1', to: '3', symbols: ['b'] },
        { id: 't3', from: '2', to: '3', symbols: ['a', 'b'] },
        { id: 't4', from: '3', to: '3', symbols: ['a', 'b'] }
      ],
      initialState: '1'
    };
    // dfa1 accepts exactly "a"

    const dfa2: Automaton = {
      type: 'DFA',
      alphabet: ['a', 'b'],
      states: [
        { id: 'A', label: 'A', x:0, y:0, initial: true, accepting: false },
        { id: 'B', label: 'B', x:0, y:0, initial: false, accepting: true },
        { id: 'C', label: 'C', x:0, y:0, initial: false, accepting: true },
        { id: 'D', label: 'D', x:0, y:0, initial: false, accepting: false }
      ],
      transitions: [
        { id: 't1', from: 'A', to: 'B', symbols: ['a'] },
        { id: 't2', from: 'A', to: 'D', symbols: ['b'] },
        { id: 't3', from: 'B', to: 'C', symbols: ['a'] }, // accepts 'aa' !
        { id: 't4', from: 'B', to: 'D', symbols: ['b'] },
        { id: 't5', from: 'C', to: 'D', symbols: ['a', 'b'] },
        { id: 't6', from: 'D', to: 'D', symbols: ['a', 'b'] }
      ],
      initialState: 'A'
    };
    // dfa2 accepts "a" and "aa"

    const result = productConstruction(dfa1, dfa2);
    expect(result.equivalent).toBe(false);
    expect(result.distinguishingString).toBe('aa');
  });
});
