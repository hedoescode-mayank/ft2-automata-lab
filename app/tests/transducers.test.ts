import { describe, it, expect } from 'vitest';
import type { Automaton } from '../src/core/automata/types';
import { simulateMoore, simulateMealy } from '../src/core/automata/transducers';

const mooreMachine: Automaton = {
  type: 'MOORE',
  alphabet: ['a', 'b'],
  states: [
    { id: 'q0', label: 'q0', x: 0, y: 0, initial: true, accepting: false, output: '0' },
    { id: 'q1', label: 'q1', x: 0, y: 0, initial: false, accepting: false, output: '1' },
  ],
  transitions: [
    { id: 't1', from: 'q0', to: 'q1', symbols: ['a'] },
    { id: 't2', from: 'q0', to: 'q0', symbols: ['b'] },
    { id: 't3', from: 'q1', to: 'q0', symbols: ['a'] },
    { id: 't4', from: 'q1', to: 'q1', symbols: ['b'] },
  ],
  initialState: 'q0'
};

const mealyMachine: Automaton = {
  type: 'MEALY',
  alphabet: ['a', 'b'],
  states: [
    { id: 'p0', label: 'p0', x: 0, y: 0, initial: true, accepting: false },
    { id: 'p1', label: 'p1', x: 0, y: 0, initial: false, accepting: false },
  ],
  transitions: [
    { id: 't1', from: 'p0', to: 'p1', symbols: ['a/1'] },
    { id: 't2', from: 'p0', to: 'p0', symbols: ['b/0'] },
    { id: 't3', from: 'p1', to: 'p0', symbols: ['a/1'] },
    { id: 't4', from: 'p1', to: 'p1', symbols: ['b/0'] },
  ],
  initialState: 'p0'
};

describe('Transducers (Moore and Mealy)', () => {
  it('Moore machine outputs correctly', () => {
    // Empty string just outputs the start state's output
    expect(simulateMoore(mooreMachine, '').output).toBe('0');
    // 'a' goes to q1 -> outputs '0' then '1'
    expect(simulateMoore(mooreMachine, 'a').output).toBe('01');
    // 'ab' goes to q1 then q1 -> '011'
    expect(simulateMoore(mooreMachine, 'ab').output).toBe('011');
    // 'aba' goes q1 -> q1 -> q0 -> '0110'
    expect(simulateMoore(mooreMachine, 'aba').output).toBe('0110');
  });

  it('Mealy machine outputs correctly', () => {
    // Empty string outputs nothing
    expect(simulateMealy(mealyMachine, '').output).toBe('');
    // 'a' -> 1
    expect(simulateMealy(mealyMachine, 'a').output).toBe('1');
    // 'ab' -> 10
    expect(simulateMealy(mealyMachine, 'ab').output).toBe('10');
    // 'aba' -> 101
    expect(simulateMealy(mealyMachine, 'aba').output).toBe('101');
  });
});
