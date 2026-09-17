export type AutomatonType = "DFA" | "NFA" | "ENFA" | "TWO_WAY" | "MOORE" | "MEALY";

export interface State {
  id: string;
  label: string;
  x: number;
  y: number;
  initial: boolean;
  accepting: boolean;
  output?: string; // Used for Moore machines
}

export interface Transition {
  id: string;
  from: string;
  to: string;
  symbols: string[];
}

export interface Automaton {
  type: AutomatonType;
  alphabet: string[];
  states: State[];
  transitions: Transition[];
  initialState: string | null;
}
