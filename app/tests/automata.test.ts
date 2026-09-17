import { describe, it, expect } from 'vitest';
import { validateAutomaton } from '../src/core/automata/validation';
import { simulateString } from '../src/core/automata/simulation';
import { Automaton } from '../src/core/automata/types';

describe('Automata Validation', () => {
  it('DFA cannot have two destinations for same state/symbol', () => {
    const dfa: Automaton = {
      type: 'DFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', x: 0, y: 0, initial: true, accepting: false }
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q0', symbols: ['0'] },
        { id: 't2', from: 'q0', to: 'q0', symbols: ['0'] } // Duplicate!
      ],
      initialState: 'q0'
    };
    const result = validateAutomaton(dfa);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('multiple transitions'))).toBe(true);
  });

  it('DFA cannot have ε transitions', () => {
    const dfa: Automaton = {
      type: 'DFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', x: 0, y: 0, initial: true, accepting: false }
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q0', symbols: ['ε'] }
      ],
      initialState: 'q0'
    };
    const result = validateAutomaton(dfa);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('ε transitions'))).toBe(true);
  });

  it('NFA can have multiple destinations but no ε transitions', () => {
    const nfa: Automaton = {
      type: 'NFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', x: 0, y: 0, initial: true, accepting: false }
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q0', symbols: ['0'] },
        { id: 't2', from: 'q0', to: 'q0', symbols: ['0'] }
      ],
      initialState: 'q0'
    };
    const result1 = validateAutomaton(nfa);
    expect(result1.isValid).toBe(true);

    const nfaWithEps: Automaton = {
      ...nfa,
      transitions: [{ id: 't3', from: 'q0', to: 'q0', symbols: ['ε'] }]
    };
    const result2 = validateAutomaton(nfaWithEps);
    expect(result2.isValid).toBe(false);
    expect(result2.errors.some(e => e.includes('ε transitions'))).toBe(true);
  });

  it('ENFA can have ε transitions', () => {
    const enfa: Automaton = {
      type: 'ENFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', x: 0, y: 0, initial: true, accepting: false }
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q0', symbols: ['ε'] }
      ],
      initialState: 'q0'
    };
    const result = validateAutomaton(enfa);
    expect(result.isValid).toBe(true);
  });
});

describe('Automata Simulation', () => {
  it('DFA acceptance works', () => {
    const dfa: Automaton = {
      type: 'DFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', x: 0, y: 0, initial: true, accepting: false },
        { id: 'q1', label: 'q1', x: 0, y: 0, initial: false, accepting: true }
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q1', symbols: ['1'] },
        { id: 't2', from: 'q0', to: 'q0', symbols: ['0'] },
        { id: 't3', from: 'q1', to: 'q1', symbols: ['0', '1'] }
      ],
      initialState: 'q0'
    };
    expect(simulateString(dfa, "001").accepted).toBe(true);
    expect(simulateString(dfa, "000").accepted).toBe(false);
  });

  it('NFA acceptance works', () => {
    const nfa: Automaton = {
      type: 'NFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', x: 0, y: 0, initial: true, accepting: false },
        { id: 'q1', label: 'q1', x: 0, y: 0, initial: false, accepting: true }
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q0', symbols: ['0', '1'] },
        { id: 't2', from: 'q0', to: 'q1', symbols: ['1'] }
      ],
      initialState: 'q0'
    };
    // Accepts strings ending in 1
    expect(simulateString(nfa, "001").accepted).toBe(true);
    expect(simulateString(nfa, "010").accepted).toBe(false);
  });

  it('Empty string works and accepting states work', () => {
    const dfa: Automaton = {
      type: 'DFA',
      alphabet: ['0', '1'],
      states: [
        { id: 'q0', label: 'q0', x: 0, y: 0, initial: true, accepting: true }
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q0', symbols: ['0', '1'] }
      ],
      initialState: 'q0'
    };
    expect(simulateString(dfa, "").accepted).toBe(true);
  });
});
