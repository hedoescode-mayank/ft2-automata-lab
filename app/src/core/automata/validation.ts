import type { Automaton } from "./types";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateAutomaton = (automaton: Automaton): ValidationResult => {
  const errors: string[] = [];

  // Check initial state
  const initialStates = automaton.states.filter(s => s.initial);
  if (initialStates.length === 0) {
    errors.push("Automaton must have at least one initial state.");
  }
  
  if (automaton.type === "DFA") {
    if (initialStates.length > 1) {
      errors.push("DFA cannot have more than one initial state.");
    }

    // Check DFA constraints
    for (const state of automaton.states) {
      for (const symbol of automaton.alphabet) {
        if (symbol === 'ε') continue;

        const transitions = automaton.transitions.filter(
          t => t.from === state.id && t.symbols.includes(symbol)
        );

        if (transitions.length === 0) {
          errors.push(`DFA missing transition for state ${state.id} on symbol '${symbol}'.`);
        } else if (transitions.length > 1) {
          errors.push(`DFA has multiple transitions for state ${state.id} on symbol '${symbol}'.`);
        }
      }
    }

    // Check for ε transitions
    const hasEpsilon = automaton.transitions.some(t => t.symbols.includes("ε"));
    if (hasEpsilon) {
      errors.push("DFA cannot have ε transitions.");
    }
  }

  if (automaton.type === "NFA") {
    // NFA can have multiple destinations, but NO ε transitions
    const hasEpsilon = automaton.transitions.some(t => t.symbols.includes("ε"));
    if (hasEpsilon) {
      errors.push("NFA cannot have ε transitions (use ENFA).");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
