import type { Grammar, Production } from '../grammar';

/**
 * CFG Simplification and CNF Conversion Engine
 */

export const removeEpsilonProductions = (grammar: Grammar): Grammar => {
  // Find nullable variables
  const nullable = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of grammar.productions) {
      if (!nullable.has(p.lhs)) {
        if (p.rhs.length === 0 || (p.rhs.length === 1 && p.rhs[0] === 'ε')) {
          nullable.add(p.lhs);
          changed = true;
        } else if (p.rhs.every(sym => nullable.has(sym))) {
          nullable.add(p.lhs);
          changed = true;
        }
      }
    }
  }

  // Generate new productions
  const newProductions: Production[] = [];
  const addIfUnique = (lhs: string, rhs: string[]) => {
    if (rhs.length === 0) return; // don't add epsilon back unless it's start symbol
    const rhsStr = rhs.join('');
    if (!newProductions.some(p => p.lhs === lhs && p.rhs.join('') === rhsStr)) {
      newProductions.push({ id: `p_${Date.now()}_${Math.random()}`, lhs, rhs });
    }
  };

  for (const p of grammar.productions) {
    if (p.rhs.length === 1 && p.rhs[0] === 'ε') continue;

    // Generate all combinations for nullable variables
    const generateCombinations = (index: number, currentRhs: string[]) => {
      if (index === p.rhs.length) {
        if (currentRhs.length > 0) addIfUnique(p.lhs, currentRhs);
        return;
      }
      
      const sym = p.rhs[index];
      if (nullable.has(sym)) {
        // Option 1: include it
        generateCombinations(index + 1, [...currentRhs, sym]);
        // Option 2: exclude it
        generateCombinations(index + 1, currentRhs);
      } else {
        generateCombinations(index + 1, [...currentRhs, sym]);
      }
    };

    generateCombinations(0, []);
  }

  // If Start symbol is nullable, add S -> ε back
  if (nullable.has(grammar.startSymbol)) {
    newProductions.push({ id: `p_${Date.now()}_eps`, lhs: grammar.startSymbol, rhs: ['ε'] });
  }

  return { ...grammar, productions: newProductions };
};

export const removeUnitProductions = (grammar: Grammar): Grammar => {
  // Find all unit pairs (A, B) meaning A =>* B
  const unitPairs = new Set<string>();
  const addPair = (a: string, b: string) => unitPairs.add(`${a},${b}`);
  
  for (const v of grammar.variables) addPair(v, v);
  
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of grammar.productions) {
      if (p.rhs.length === 1 && grammar.variables.includes(p.rhs[0])) {
        // A -> B
        const A = p.lhs;
        const B = p.rhs[0];
        // If X =>* A and A -> B, then X =>* B
        for (const v of grammar.variables) {
          if (unitPairs.has(`${v},${A}`) && !unitPairs.has(`${v},${B}`)) {
            addPair(v, B);
            changed = true;
          }
        }
      }
    }
  }

  const newProductions: Production[] = [];
  const addIfUnique = (lhs: string, rhs: string[]) => {
    const rhsStr = rhs.join('');
    if (!newProductions.some(p => p.lhs === lhs && p.rhs.join('') === rhsStr)) {
      newProductions.push({ id: `p_${Date.now()}_${Math.random()}`, lhs, rhs });
    }
  };

  // For every pair (A, B) where A =>* B, add A -> rhs for every non-unit B -> rhs
  for (const pair of Array.from(unitPairs)) {
    const [A, B] = pair.split(',');
    for (const p of grammar.productions) {
      if (p.lhs === B) {
        const isUnit = p.rhs.length === 1 && grammar.variables.includes(p.rhs[0]);
        if (!isUnit) {
          addIfUnique(A, p.rhs);
        }
      }
    }
  }

  return { ...grammar, productions: newProductions };
};

export const removeUselessSymbols = (grammar: Grammar): Grammar => {
  // 1. Find generating symbols (can produce string of terminals)
  const generating = new Set<string>([...grammar.terminals, 'ε']);
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of grammar.productions) {
      if (!generating.has(p.lhs)) {
        if (p.rhs.every(sym => generating.has(sym))) {
          generating.add(p.lhs);
          changed = true;
        }
      }
    }
  }

  // Filter out non-generating
  let newProds = grammar.productions.filter(p => generating.has(p.lhs) && p.rhs.every(sym => generating.has(sym)));

  // 2. Find reachable symbols from start symbol
  const reachable = new Set<string>([grammar.startSymbol]);
  changed = true;
  while (changed) {
    changed = false;
    for (const p of newProds) {
      if (reachable.has(p.lhs)) {
        for (const sym of p.rhs) {
          if (!reachable.has(sym) && (grammar.variables.includes(sym) || grammar.terminals.includes(sym))) {
            reachable.add(sym);
            changed = true;
          }
        }
      }
    }
  }

  // Filter out non-reachable
  newProds = newProds.filter(p => reachable.has(p.lhs) && p.rhs.every(sym => reachable.has(sym) || sym === 'ε'));
  
  const newVariables = grammar.variables.filter(v => reachable.has(v) && generating.has(v));
  
  return { ...grammar, productions: newProds, variables: newVariables };
};

export const convertToCNF = (grammar: Grammar): Grammar => {
  // Assume grammar is already simplified (no eps, no unit, no useless)
  let g = { ...grammar };
  let varCounter = 1;

  // 1. Replace terminals in RHS of length >= 2 with new variables
  const terminalVars = new Map<string, string>(); // 'a' -> 'X_a'
  const newProds1: Production[] = [];

  for (const p of g.productions) {
    if (p.rhs.length >= 2) {
      const newRhs = p.rhs.map(sym => {
        if (g.terminals.includes(sym)) {
          if (!terminalVars.has(sym)) {
            const v = `U${varCounter++}`;
            terminalVars.set(sym, v);
            g.variables.push(v);
            newProds1.push({ id: `p_${Date.now()}_${Math.random()}`, lhs: v, rhs: [sym] });
          }
          return terminalVars.get(sym)!;
        }
        return sym;
      });
      newProds1.push({ ...p, rhs: newRhs });
    } else {
      newProds1.push(p);
    }
  }
  g.productions = newProds1;

  // 2. Break down RHS of length >= 3
  const newProds2: Production[] = [];
  for (const p of g.productions) {
    if (p.rhs.length >= 3) {
      let currentLhs = p.lhs;
      for (let i = 0; i < p.rhs.length - 2; i++) {
        const newVar = `V${varCounter++}`;
        g.variables.push(newVar);
        newProds2.push({
          id: `p_${Date.now()}_${Math.random()}`,
          lhs: currentLhs,
          rhs: [p.rhs[i], newVar]
        });
        currentLhs = newVar;
      }
      newProds2.push({
        id: `p_${Date.now()}_${Math.random()}`,
        lhs: currentLhs,
        rhs: [p.rhs[p.rhs.length - 2], p.rhs[p.rhs.length - 1]]
      });
    } else {
      newProds2.push(p);
    }
  }
  g.productions = newProds2;

  return g;
};
