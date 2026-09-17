export interface Production {
  id: string;
  lhs: string; // Left Hand Side (Variable)
  rhs: string[]; // Right Hand Side (Array of variables/terminals for one alternative, e.g. ['A', 'B'])
}

export interface Grammar {
  variables: string[];
  terminals: string[];
  productions: Production[];
  startSymbol: string;
}

export const createGrammar = (): Grammar => ({
  variables: ['S'],
  terminals: ['a', 'b'],
  productions: [],
  startSymbol: 'S'
});

export const addProduction = (grammar: Grammar, lhs: string, rhs: string[]): Grammar => ({
  ...grammar,
  productions: [...grammar.productions, { id: `p${grammar.productions.length}`, lhs, rhs }],
  variables: Array.from(new Set([...grammar.variables, lhs]))
});

// Check if grammar is in Chomsky Normal Form
export const isCNF = (grammar: Grammar): boolean => {
  for (const p of grammar.productions) {
    // S -> ε is allowed in some conventions, but generally CNF is A -> BC or A -> a
    if (p.rhs.length === 0 || (p.rhs.length === 1 && p.rhs[0] === 'ε')) {
      if (p.lhs !== grammar.startSymbol) return false;
    } else if (p.rhs.length === 1) {
      // Must be a terminal
      if (!grammar.terminals.includes(p.rhs[0])) return false;
    } else if (p.rhs.length === 2) {
      // Must be two variables
      if (!grammar.variables.includes(p.rhs[0]) || !grammar.variables.includes(p.rhs[1])) return false;
    } else {
      // No RHS > 2
      return false;
    }
  }
  return true;
};
