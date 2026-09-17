// ─── Token Types ────────────────────────────────────────────────────────────

export type TokenType =
  | 'CHAR'     // literal character: a, b, 0, 1 …
  | 'UNION'    // |
  | 'STAR'     // *
  | 'PLUS'     // +
  | 'QUESTION' // ?
  | 'LPAREN'   // (
  | 'RPAREN'   // )
  | 'EPSILON'  // ε or \e
  | 'EMPTY';   // ∅

export interface Token {
  type: TokenType;
  value: string;
}

// ─── Tokenizer ──────────────────────────────────────────────────────────────

/**
 * Tokenize a regex string.
 * Supports: a-z, A-Z, 0-9, ε (or \e or e as epsilon), ∅, |, *, +, ?, (, )
 * Special: inserts implicit CONCAT tokens where needed.
 */
export const tokenize = (input: string): Token[] => {
  const raw: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (ch === '|') { raw.push({ type: 'UNION', value: '|' }); i++; continue; }
    if (ch === '*') { raw.push({ type: 'STAR',  value: '*' }); i++; continue; }
    if (ch === '+') { raw.push({ type: 'PLUS',  value: '+' }); i++; continue; }
    if (ch === '?') { raw.push({ type: 'QUESTION', value: '?' }); i++; continue; }
    if (ch === '(') { raw.push({ type: 'LPAREN', value: '(' }); i++; continue; }
    if (ch === ')') { raw.push({ type: 'RPAREN', value: ')' }); i++; continue; }
    if (ch === 'ε' || ch === '\u03b5') { raw.push({ type: 'EPSILON', value: 'ε' }); i++; continue; }
    if (ch === '∅') { raw.push({ type: 'EMPTY', value: '∅' }); i++; continue; }
    // Escape: \e for epsilon
    if (ch === '\\' && input[i+1] === 'e') { raw.push({ type: 'EPSILON', value: 'ε' }); i+=2; continue; }
    if (ch === ' ' || ch === '\t') { i++; continue; } // skip whitespace

    // Everything else: literal character
    raw.push({ type: 'CHAR', value: ch });
    i++;
  }

  // Insert implicit concatenation
  const tokens: Token[] = [];
  for (let j = 0; j < raw.length; j++) {
    tokens.push(raw[j]);

    if (j + 1 < raw.length) {
      const cur  = raw[j];
      const next = raw[j + 1];

      // Implicit concat between: (CHAR|STAR|PLUS|QUESTION|RPAREN|EPSILON|EMPTY) followed by (CHAR|LPAREN|EPSILON|EMPTY)
      const concatAfter: TokenType[] = ['CHAR','STAR','PLUS','QUESTION','RPAREN','EPSILON','EMPTY'];
      const concatBefore: TokenType[] = ['CHAR','LPAREN','EPSILON','EMPTY'];

      if (concatAfter.includes(cur.type) && concatBefore.includes(next.type)) {
        tokens.push({ type: 'CHAR', value: '\u00b7' }); // · as internal concat marker
      }
    }
  }

  return tokens;
};
