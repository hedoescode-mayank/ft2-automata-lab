export type AutomatonType = "DFA" | "NFA" | "ENFA";

export interface State {
  id: string;
  label: string;
  x: number;
  y: number;
  initial: boolean;
  accepting: boolean;
}

export interface Transition {
  id: string;
  from: string;
  to: string;
  symbols: string[]; // ['0', '1'], or ['ε']
}

export interface Automaton {
  type: AutomatonType;
  alphabet: string[];
  states: State[];
  transitions: Transition[];
}

export const createAutomaton = (type: AutomatonType, alphabet: string[] = ['0', '1']): Automaton => ({
  type,
  alphabet,
  states: [],
  transitions: []
});

export const addState = (automaton: Automaton, state: Omit<State, 'id'>): Automaton => ({
  ...automaton,
  states: [...automaton.states, { ...state, id: `q${automaton.states.length}` }]
});

export const addTransition = (automaton: Automaton, transition: Omit<Transition, 'id'>): Automaton => ({
  ...automaton,
  transitions: [...automaton.transitions, { ...transition, id: `t${automaton.transitions.length}` }]
});
