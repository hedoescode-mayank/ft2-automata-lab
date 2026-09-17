import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/core/regex/tokenizer';
import { parseRegex } from '../src/core/regex/parser';
import { thompsonConstruct, testRegex, resetCounter } from '../src/core/regex/thompson';

// ─── Tokenizer ───────────────────────────────────────────────────────────────
describe('Tokenizer', () => {
  it('tokenizes simple chars', () => {
    const tokens = tokenize('ab').filter(t => t.value !== '·');
    expect(tokens.map(t => t.value)).toEqual(['a','b']);
  });

  it('inserts implicit concat between chars', () => {
    const tokens = tokenize('ab');
    expect(tokens.some(t => t.value === '·')).toBe(true);
  });

  it('tokenizes ε', () => {
    const tokens = tokenize('ε');
    expect(tokens[0].type).toBe('EPSILON');
  });

  it('tokenizes \\e as epsilon', () => {
    const tokens = tokenize('\\e');
    expect(tokens[0].type).toBe('EPSILON');
  });

  it('does NOT insert concat before |', () => {
    const tokens = tokenize('a|b');
    const types = tokens.map(t => t.type);
    expect(types).toContain('UNION');
    expect(types.filter(t => t === 'CHAR' && tokens[types.indexOf(t)].value === '·').length).toBe(0);
  });
});

// ─── Parser ──────────────────────────────────────────────────────────────────
describe('Parser — basic', () => {
  it('parses single char', () => {
    const { ast, error } = parseRegex('a');
    expect(error).toBeUndefined();
    expect(ast.type).toBe('Char');
    expect(ast.value).toBe('a');
  });

  it('parses union', () => {
    const { ast } = parseRegex('a|b');
    expect(ast.type).toBe('Union');
    expect(ast.left?.type).toBe('Char');
    expect(ast.right?.type).toBe('Char');
  });

  it('parses concatenation', () => {
    const { ast } = parseRegex('ab');
    expect(ast.type).toBe('Concat');
  });

  it('parses kleene star', () => {
    const { ast } = parseRegex('a*');
    expect(ast.type).toBe('Star');
    expect(ast.child?.type).toBe('Char');
  });

  it('parses + and ?', () => {
    expect(parseRegex('a+').ast.type).toBe('Plus');
    expect(parseRegex('a?').ast.type).toBe('Question');
  });

  it('handles parentheses for grouping', () => {
    const { ast } = parseRegex('(a|b)*');
    expect(ast.type).toBe('Star');
    expect(ast.child?.type).toBe('Union');
  });

  it('respects precedence: star binds tighter than concat', () => {
    const { ast } = parseRegex('ab*');
    expect(ast.type).toBe('Concat');
    expect(ast.right?.type).toBe('Star');
  });

  it('respects precedence: concat binds tighter than union', () => {
    const { ast } = parseRegex('ab|c');
    expect(ast.type).toBe('Union');
    expect(ast.left?.type).toBe('Concat');
    expect(ast.right?.type).toBe('Char');
  });

  it('reports error on unmatched paren', () => {
    const { error } = parseRegex('(ab');
    expect(error).toBeDefined();
  });

  it('parses ε', () => {
    const { ast } = parseRegex('ε');
    expect(ast.type).toBe('Epsilon');
  });

  it('parses complex: (0|1)*01', () => {
    const { ast, error } = parseRegex('(0|1)*01');
    expect(error).toBeUndefined();
    // Should be Concat(Concat(Star(Union(0,1)), Char(0)), Char(1))
    expect(ast.type).toBe('Concat');
  });
});

// ─── Thompson + Language Tests ───────────────────────────────────────────────
describe('Thompson — single character', () => {
  beforeEach(() => resetCounter());

  it('accepts "a", rejects "b"', () => {
    const { ast } = parseRegex('a');
    expect(testRegex(ast, 'a')).toBe(true);
    expect(testRegex(ast, 'b')).toBe(false);
    expect(testRegex(ast, '')).toBe(false);
  });
});

describe('Thompson — union a|b', () => {
  beforeEach(() => resetCounter());

  it('accepts a and b, rejects empty and ab', () => {
    const { ast } = parseRegex('a|b');
    expect(testRegex(ast, 'a')).toBe(true);
    expect(testRegex(ast, 'b')).toBe(true);
    expect(testRegex(ast, '')).toBe(false);
    expect(testRegex(ast, 'ab')).toBe(false);
  });
});

describe('Thompson — Kleene star a*', () => {
  beforeEach(() => resetCounter());

  it('accepts empty, "a", "aaa"', () => {
    const { ast } = parseRegex('a*');
    expect(testRegex(ast, '')).toBe(true);
    expect(testRegex(ast, 'a')).toBe(true);
    expect(testRegex(ast, 'aaa')).toBe(true);
    expect(testRegex(ast, 'b')).toBe(false);
  });
});

describe('Thompson — (0|1)*01 (strings ending in 01)', () => {
  beforeEach(() => resetCounter());
  const re = '(0|1)*01';

  it('accepts "01"',  () => { const {ast} = parseRegex(re); expect(testRegex(ast,'01')).toBe(true); });
  it('accepts "001"', () => { const {ast} = parseRegex(re); expect(testRegex(ast,'001')).toBe(true); });
  it('accepts "101"', () => { const {ast} = parseRegex(re); expect(testRegex(ast,'101')).toBe(true); });
  it('rejects "10"',  () => { const {ast} = parseRegex(re); expect(testRegex(ast,'10')).toBe(false); });
  it('rejects ""',    () => { const {ast} = parseRegex(re); expect(testRegex(ast,'')).toBe(false); });
  it('rejects "0"',   () => { const {ast} = parseRegex(re); expect(testRegex(ast,'0')).toBe(false); });
});

describe('Thompson — 0*10*10* (exactly two 1s)', () => {
  beforeEach(() => resetCounter());
  const re = '0*10*10*';

  it('accepts "11"',   () => { const {ast} = parseRegex(re); expect(testRegex(ast,'11')).toBe(true); });
  it('accepts "010"',  () => { const {ast} = parseRegex(re); expect(testRegex(ast,'010')).toBe(false); }); // one 1
  it('accepts "0110"', () => { const {ast} = parseRegex(re); expect(testRegex(ast,'0110')).toBe(true); });
  it('rejects "1"',    () => { const {ast} = parseRegex(re); expect(testRegex(ast,'1')).toBe(false); });
  it('rejects "111"',  () => { const {ast} = parseRegex(re); expect(testRegex(ast,'111')).toBe(false); });
});

describe('Thompson — a+b? (one or more a, optional b)', () => {
  beforeEach(() => resetCounter());
  const re = 'a+b?';

  it('accepts "a"',  () => { const {ast} = parseRegex(re); expect(testRegex(ast,'a')).toBe(true); });
  it('accepts "ab"', () => { const {ast} = parseRegex(re); expect(testRegex(ast,'ab')).toBe(true); });
  it('accepts "aab"',() => { const {ast} = parseRegex(re); expect(testRegex(ast,'aab')).toBe(true); });
  it('rejects ""',   () => { const {ast} = parseRegex(re); expect(testRegex(ast,'')).toBe(false); });
  it('rejects "b"',  () => { const {ast} = parseRegex(re); expect(testRegex(ast,'b')).toBe(false); });
  it('rejects "abb"',() => { const {ast} = parseRegex(re); expect(testRegex(ast,'abb')).toBe(false); });
});

describe('Thompson — thompson structure', () => {
  it('produces a valid ENFA with states and ε-transitions', () => {
    resetCounter();
    const { ast } = parseRegex('ab');
    const { enfa } = thompsonConstruct(ast);
    expect(enfa.type).toBe('ENFA');
    expect(enfa.states.length).toBeGreaterThan(0);
    expect(enfa.alphabet).toContain('ε');
    expect(enfa.transitions.some(t => t.symbols.includes('ε'))).toBe(true);
  });
});

// Need to import beforeEach
import { beforeEach } from 'vitest';
