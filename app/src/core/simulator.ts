import type { Automaton } from './automata';

export const epsilonClosure = (states: string[], automaton: Automaton): string[] => {
  const closure = new Set(states);
  const stack = [...states];

  while (stack.length > 0) {
    const currentState = stack.pop()!;
    const epsilonTransitions = automaton.transitions.filter(
      (t) => t.from === currentState && t.symbols.includes('ε')
    );

    for (const t of epsilonTransitions) {
      if (!closure.has(t.to)) {
        closure.add(t.to);
        stack.push(t.to);
      }
    }
  }

  return Array.from(closure).sort();
};

export const move = (states: string[], symbol: string, automaton: Automaton): string[] => {
  const nextStates = new Set<string>();

  for (const state of states) {
    const transitions = automaton.transitions.filter(
      (t) => t.from === state && t.symbols.includes(symbol)
    );
    for (const t of transitions) {
      nextStates.add(t.to);
    }
  }

  return Array.from(nextStates).sort();
};

export const simulateString = (automaton: Automaton, input: string): { accepted: boolean; path: string[] } => {
  let currentStates = automaton.states.filter((s) => s.initial).map((s) => s.id);
  
  if (automaton.type === 'ENFA') {
    currentStates = epsilonClosure(currentStates, automaton);
  }

  const path = [currentStates.join(',')];

  for (const char of input) {
    currentStates = move(currentStates, char, automaton);
    if (automaton.type === 'ENFA') {
      currentStates = epsilonClosure(currentStates, automaton);
    }
    path.push(currentStates.join(','));
  }

  const acceptingIds = new Set(automaton.states.filter(s => s.accepting).map(s => s.id));
  const accepted = currentStates.some(state => acceptingIds.has(state));

  return { accepted, path };
};
