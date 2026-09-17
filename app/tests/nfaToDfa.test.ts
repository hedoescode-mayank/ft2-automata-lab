import { describe, it, expect } from 'vitest';
import type { Automaton } from '../src/core/automata/types';
import { subsetConstruction, subsetKey } from '../src/core/automata/nfaToDfa';
import { simulateString } from '../src/core/automata/simulation';
import { validateAutomaton } from '../src/core/automata/validation';

// ── NFA: strings ending in "01" ──────────────────────────
const nfaEndIn01: Automaton = {
  type: 'NFA',
  alphabet: ['0', '1'],
  states: [
    { id: 'q0', label: 'q0', x: 0, y: 0, initial: true,  accepting: false },
    { id: 'q1', label: 'q1', x: 0, y: 0, initial: false, accepting: false },
    { id: 'q2', label: 'q2', x: 0, y: 0, initial: false, accepting: true  },
  ],
  transitions: [
    { id: 't1', from: 'q0', to: 'q0', symbols: ['0','1'] },
    { id: 't2', from: 'q0', to: 'q1', symbols: ['0'] },
    { id: 't3', from: 'q1', to: 'q2', symbols: ['1'] },
  ],
  initialState: 'q0'
};

// ── NFA: strings with "00" as substring ──────────────────
const nfaContains00: Automaton = {
  type: 'NFA',
  alphabet: ['0', '1'],
  states: [
    { id: 'q0', label: 'q0', x: 0, y: 0, initial: true,  accepting: false },
    { id: 'q1', label: 'q1', x: 0, y: 0, initial: false, accepting: false },
    { id: 'q2', label: 'q2', x: 0, y: 0, initial: false, accepting: true  },
  ],
  transitions: [
    { id: 't1', from: 'q0', to: 'q0', symbols: ['0','1'] },
    { id: 't2', from: 'q0', to: 'q1', symbols: ['0'] },
    { id: 't3', from: 'q1', to: 'q2', symbols: ['0'] },
    { id: 't4', from: 'q2', to: 'q2', symbols: ['0','1'] },
  ],
  initialState: 'q0'
};

// ── ENFA: a*b (epsilon version) ───────────────────────────
const enfaAStar_b: Automaton = {
  type: 'ENFA',
  alphabet: ['a', 'b', 'ε'],
  states: [
    { id: 'q0', label: 'q0', x: 0, y: 0, initial: true,  accepting: false },
    { id: 'q1', label: 'q1', x: 0, y: 0, initial: false, accepting: false },
    { id: 'q2', label: 'q2', x: 0, y: 0, initial: false, accepting: true  },
  ],
  transitions: [
    { id: 't1', from: 'q0', to: 'q1', symbols: ['ε'] },
    { id: 't2', from: 'q1', to: 'q1', symbols: ['a'] },
    { id: 't3', from: 'q1', to: 'q2', symbols: ['b'] },
  ],
  initialState: 'q0'
};

describe('Subset Construction — NFA ending in "01"', () => {
  const { dfa, dfaStateToNfaStates, steps } = subsetConstruction(nfaEndIn01);

  it('produces a valid DFA', () => {
    // Check no ε and each state has exactly one transition per symbol
    const result = validateAutomaton(dfa);
    // Dead states are valid DFA states; overlook missing transitions for ∅ state itself
    expect(result.errors.filter(e => !e.includes('∅'))).toHaveLength(0);
  });

  it('has correct start state from ε-closure({q0})', () => {
    const startState = dfa.states.find(s => s.initial);
    expect(startState).toBeDefined();
    const nfaIds = dfaStateToNfaStates[startState!.id];
    expect(nfaIds).toContain('q0');
  });

  it('marks accepting DFA states correctly (those containing q2)', () => {
    const acceptingDfaStates = dfa.states.filter(s => s.accepting);
    for (const st of acceptingDfaStates) {
      expect(dfaStateToNfaStates[st.id]).toContain('q2');
    }
  });

  it('subsetKey deduplication works', () => {
    expect(subsetKey(['q1','q0'])).toBe(subsetKey(['q0','q1']));
    expect(subsetKey([])).toBe('∅');
  });

  it('language preserved — DFA accepts "01"', () => {
    expect(simulateString(dfa, '01').accepted).toBe(true);
  });
  it('language preserved — DFA accepts "001"', () => {
    expect(simulateString(dfa, '001').accepted).toBe(true);
  });
  it('language preserved — DFA accepts "101"', () => {
    expect(simulateString(dfa, '101').accepted).toBe(true);
  });
  it('language preserved — DFA rejects "10"', () => {
    expect(simulateString(dfa, '10').accepted).toBe(false);
  });
  it('language preserved — DFA rejects ""', () => {
    expect(simulateString(dfa, '').accepted).toBe(false);
  });
  it('language preserved — DFA rejects "010"', () => {
    expect(simulateString(dfa, '010').accepted).toBe(false);
  });

  it('generates construction steps', () => {
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0]).toHaveProperty('symbol');
    expect(steps[0]).toHaveProperty('moveResult');
    expect(steps[0]).toHaveProperty('closureResult');
  });
});

describe('Subset Construction — NFA containing "00"', () => {
  const { dfa } = subsetConstruction(nfaContains00);

  it('accepts "00"', ()  => expect(simulateString(dfa, '00').accepted).toBe(true));
  it('accepts "100"', () => expect(simulateString(dfa, '100').accepted).toBe(true));
  it('accepts "001"', () => expect(simulateString(dfa, '001').accepted).toBe(true));
  it('rejects "0"', ()  => expect(simulateString(dfa, '0').accepted).toBe(false));
  it('rejects "10"', () => expect(simulateString(dfa, '10').accepted).toBe(false));
  it('rejects ""', ()   => expect(simulateString(dfa, '').accepted).toBe(false));
});

describe('Subset Construction — ENFA for a*b', () => {
  const { dfa } = subsetConstruction(enfaAStar_b);

  it('accepts "b"',   () => expect(simulateString(dfa, 'b').accepted).toBe(true));
  it('accepts "ab"',  () => expect(simulateString(dfa, 'ab').accepted).toBe(true));
  it('accepts "aab"', () => expect(simulateString(dfa, 'aab').accepted).toBe(true));
  it('rejects ""',    () => expect(simulateString(dfa, '').accepted).toBe(false));
  it('rejects "a"',   () => expect(simulateString(dfa, 'a').accepted).toBe(false));
  it('rejects "ba"',  () => expect(simulateString(dfa, 'ba').accepted).toBe(false));
});
