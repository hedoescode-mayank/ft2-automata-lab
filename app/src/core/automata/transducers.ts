import type { Automaton } from './types';

/**
 * Simulates a Moore machine on an input string.
 * A Moore machine outputs a character on every state it visits, INCLUDING the initial state.
 * @returns { output: string, path: string[] }
 */
export const simulateMoore = (machine: Automaton, input: string): { output: string; path: string[] } => {
  if (machine.type !== 'MOORE') {
    throw new Error('Not a Moore machine');
  }

  let currentStateId = machine.initialState;
  const path: string[] = [];
  let output = '';

  if (!currentStateId) {
    return { output, path };
  }

  // 1. Output of the initial state
  let currentState = machine.states.find(s => s.id === currentStateId);
  if (currentState) {
    path.push(currentState.id);
    output += currentState.output ?? '';
  }

  // 2. Process each input symbol
  for (const char of input) {
    const transition = machine.transitions.find(
      t => t.from === currentStateId && t.symbols.includes(char)
    );

    if (!transition) {
      // Machine crashes/halts if no transition is defined
      break;
    }

    currentStateId = transition.to;
    currentState = machine.states.find(s => s.id === currentStateId);
    
    if (currentState) {
      path.push(currentState.id);
      output += currentState.output ?? '';
    }
  }

  return { output, path };
};

/**
 * Simulates a Mealy machine on an input string.
 * A Mealy machine outputs a character ONLY upon taking a transition.
 * Transitions encode output in the format "input/output" within the symbols array.
 * @returns { output: string, path: string[] }
 */
export const simulateMealy = (machine: Automaton, input: string): { output: string; path: string[] } => {
  if (machine.type !== 'MEALY') {
    throw new Error('Not a Mealy machine');
  }

  let currentStateId = machine.initialState;
  const path: string[] = [];
  let output = '';

  if (!currentStateId) {
    return { output, path };
  }

  path.push(currentStateId);

  // Process each input symbol
  for (const char of input) {
    // Find transition where one of the symbols matches "char/..."
    let matchedOutput = '';
    const transition = machine.transitions.find(t => {
      if (t.from !== currentStateId) return false;
      
      const symObj = t.symbols.find(sym => sym.startsWith(char + '/'));
      if (symObj) {
        matchedOutput = symObj.split('/')[1] ?? '';
        return true;
      }
      return false;
    });

    if (!transition) {
      // Machine crashes/halts if no transition is defined
      break;
    }

    currentStateId = transition.to;
    path.push(currentStateId);
    output += matchedOutput;
  }

  return { output, path };
};
