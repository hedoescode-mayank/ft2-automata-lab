import type { Automaton, AutomatonType } from "./types";

export const createAutomaton = (type: AutomatonType, alphabet: string[] = ['0', '1']): Automaton => ({
  type,
  alphabet,
  states: [],
  transitions: [],
  initialState: null
});
