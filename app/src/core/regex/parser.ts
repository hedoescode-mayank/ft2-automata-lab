import { tokenize } from './tokenizer';
import type { Token, TokenType } from './tokenizer';
import type { RegexNode } from './ast';
import {
  charNode, epsilonNode, emptyNode,
  unionNode, concatNode, starNode, plusNode, questionNode
} from './ast';

// ─── Recursive Descent Parser ────────────────────────────────────────────────
// Grammar (with precedence):
//   expr    → concat ( '|' concat )*
//   concat  → factor ( factor )*         [implicit concatenation]
//   factor  → atom ( '*' | '+' | '?' )*
//   atom    → CHAR | EPSILON | EMPTY | '(' expr ')'

export interface ParseResult {
  ast: RegexNode;
  error?: string;
}

class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(input: string) {
    // Filter out the internal '·' concat markers — we handle concat explicitly
    this.tokens = tokenize(input).filter(t => !(t.type === 'CHAR' && t.value === '\u00b7'));
  }

  private peek(): Token | null {
    return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
  }

  private consume(type?: TokenType): Token {
    const t = this.tokens[this.pos];
    if (!t) throw new Error('Unexpected end of input');
    if (type && t.type !== type) throw new Error(`Expected ${type} but got ${t.type} ('${t.value}')`);
    this.pos++;
    return t;
  }

  parse(): RegexNode {
    if (this.tokens.length === 0) return epsilonNode();
    const node = this.parseExpr();
    if (this.pos < this.tokens.length) {
      throw new Error(`Unexpected token '${this.peek()!.value}' at position ${this.pos}`);
    }
    return node;
  }

  // expr → concat ( '|' concat )*
  private parseExpr(): RegexNode {
    let left = this.parseConcat();

    while (this.peek()?.type === 'UNION') {
      this.consume('UNION');
      const right = this.parseConcat();
      left = unionNode(left, right);
    }

    return left;
  }

  // concat → factor ( factor )*  [but NOT starting with | or ) or end]
  private parseConcat(): RegexNode {
    const canStartFactor = (t: Token | null): boolean => {
      if (!t) return false;
      return t.type === 'CHAR' || t.type === 'EPSILON' || t.type === 'EMPTY' || t.type === 'LPAREN';
    };

    if (!canStartFactor(this.peek())) {
      // epsilon on empty concat
      return epsilonNode();
    }

    let left = this.parseFactor();

    while (canStartFactor(this.peek())) {
      const right = this.parseFactor();
      left = concatNode(left, right);
    }

    return left;
  }

  // factor → atom ( '*' | '+' | '?' )*
  private parseFactor(): RegexNode {
    let node = this.parseAtom();

    while (true) {
      const t = this.peek();
      if (!t) break;
      if (t.type === 'STAR')     { this.consume(); node = starNode(node); }
      else if (t.type === 'PLUS')     { this.consume(); node = plusNode(node); }
      else if (t.type === 'QUESTION') { this.consume(); node = questionNode(node); }
      else break;
    }

    return node;
  }

  // atom → CHAR | EPSILON | EMPTY | '(' expr ')'
  private parseAtom(): RegexNode {
    const t = this.peek();
    if (!t) throw new Error('Expected atom but got end of input');

    if (t.type === 'CHAR') {
      this.consume();
      return charNode(t.value);
    }
    if (t.type === 'EPSILON') {
      this.consume();
      return epsilonNode();
    }
    if (t.type === 'EMPTY') {
      this.consume();
      return emptyNode();
    }
    if (t.type === 'LPAREN') {
      this.consume('LPAREN');
      const inner = this.parseExpr();
      this.consume('RPAREN');
      return inner;
    }

    throw new Error(`Unexpected token '${t.value}' (${t.type})`);
  }
}

export const parseRegex = (input: string): ParseResult => {
  try {
    const parser = new Parser(input);
    const ast = parser.parse();
    return { ast };
  } catch (e) {
    return {
      ast: epsilonNode(),
      error: e instanceof Error ? e.message : String(e),
    };
  }
};
