import { useState, useCallback } from 'react';
import { parseRegex } from '../../core/regex/parser';
import { thompsonConstruct, testRegex, resetCounter } from '../../core/regex/thompson';
import type { RegexNode } from '../../core/regex/ast';
import { astToString } from '../../core/regex/ast';
import { useStore } from '../../store/useStore';
import { CheckCircle, XCircle, Play, BookOpen } from 'lucide-react';

// ─── Preset examples ─────────────────────────────────────────────────────────
const PRESETS = [
  { label: 'Strings ending in 01',     re: '(0|1)*01',   tests: ['01','001','101','010','10','0'] },
  { label: 'Exactly two 1s',           re: '0*10*10*',   tests: ['11','011','110','0110','1','111'] },
  { label: 'Even length binary',       re: '((0|1)(0|1))*', tests: ['','00','01','11','010','0000'] },
  { label: 'Starts with 0',            re: '0(0|1)*',    tests: ['0','01','001','10','1',''] },
  { label: 'Contains 101',             re: '(0|1)*101(0|1)*', tests: ['101','0101','1010','01','10',''] },
  { label: 'One or more a, optional b',re: 'a+b?',       tests: ['a','ab','aab','','b','abb'] },
];

// ─── AST Pretty Printer (tree view) ─────────────────────────────────────────
interface ASTNodeProps {
  node: RegexNode;
  depth?: number;
}

const NODE_COLORS: Record<string, string> = {
  Char:     'bg-cyan-900/50 border-cyan-600 text-cyan-300',
  Epsilon:  'bg-slate-800 border-slate-600 text-slate-400',
  Empty:    'bg-slate-800 border-red-600/50 text-red-400',
  Union:    'bg-violet-900/50 border-violet-600 text-violet-300',
  Concat:   'bg-blue-900/50 border-blue-600 text-blue-300',
  Star:     'bg-emerald-900/50 border-emerald-600 text-emerald-300',
  Plus:     'bg-teal-900/50 border-teal-600 text-teal-300',
  Question: 'bg-amber-900/50 border-amber-600 text-amber-300',
};

const getNodeLabel = (node: RegexNode): string => {
  switch (node.type) {
    case 'Char':     return `'${node.value}'`;
    case 'Epsilon':  return 'ε';
    case 'Empty':    return '∅';
    case 'Union':    return '|  (union)';
    case 'Concat':   return '·  (concat)';
    case 'Star':     return '*  (star)';
    case 'Plus':     return '+  (plus)';
    case 'Question': return '?  (question)';
  }
};

const ASTNode = ({ node, depth = 0 }: ASTNodeProps) => {
  const label = getNodeLabel(node);
  const colors = NODE_COLORS[node.type] ?? 'bg-slate-800 border-slate-600 text-slate-400';

  const children: RegexNode[] = [];
  if (node.left)  children.push(node.left);
  if (node.right) children.push(node.right);
  if (node.child) children.push(node.child);

  return (
    <div className="flex flex-col items-center">
      <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold ${colors} whitespace-nowrap`}>
        {label}
      </div>
      {children.length > 0 && (
        <div className="flex gap-6 mt-3 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-slate-700" />
          {children.map((child, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-px h-3 bg-slate-700 mx-auto" />
              <ASTNode node={child} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Lab ────────────────────────────────────────────────────────────────
export const RegexLab = () => {
  const { setAutomaton } = useStore();
  const [regexInput, setRegexInput] = useState('(0|1)*01');
  const [parseResult, setParseResult] = useState<ReturnType<typeof parseRegex> | null>(null);
  const [testStrings, setTestStrings] = useState<string[]>(['01','001','101','010','10','0']);
  const [newTest, setNewTest] = useState('');
  const [enfaBuilt, setEnfaBuilt] = useState(false);

  const handleParse = useCallback(() => {
    resetCounter();
    const result = parseRegex(regexInput);
    setParseResult(result);
    setEnfaBuilt(false);
  }, [regexInput]);

  const handleBuildNFA = () => {
    if (!parseResult?.ast || parseResult.error) return;
    resetCounter();
    const { enfa } = thompsonConstruct(parseResult.ast);
    setAutomaton(enfa);
    setEnfaBuilt(true);
  };

  const handlePreset = (preset: typeof PRESETS[0]) => {
    setRegexInput(preset.re);
    setTestStrings(preset.tests);
    setParseResult(null);
    setEnfaBuilt(false);
  };

  const addTestString = () => {
    if (newTest !== '' && !testStrings.includes(newTest)) {
      setTestStrings(prev => [...prev, newTest]);
    }
    setNewTest('');
  };

  const testResult = (str: string): boolean | null => {
    if (!parseResult?.ast || parseResult.error) return null;
    resetCounter();
    return testRegex(parseResult.ast, str);
  };

  const accepted = testStrings.filter(s => testResult(s) === true);
  const rejected = testStrings.filter(s => testResult(s) === false);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
      {/* Header */}
      <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-4 shrink-0">
        <span className="font-bold text-emerald-400 text-sm">Regex Laboratory</span>
        <span className="text-xs text-slate-500">Thompson Construction · RE ↔ FA</span>
        <div className="ml-auto text-xs text-slate-600">
          Supported: a-z, 0-9, |, *, +, ?, (, ), ε
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* Left: Input + Presets */}
        <div className="w-72 border-r border-slate-700 flex flex-col">
          <div className="px-3 py-2 bg-slate-800/60 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Regular Expression
          </div>

          <div className="p-3 space-y-3">
            {/* Regex Input */}
            <div>
              <input
                type="text"
                value={regexInput}
                onChange={e => setRegexInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleParse()}
                className="w-full text-sm bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                placeholder="Enter regex…"
              />
              {parseResult?.error && (
                <p className="text-xs text-rose-400 mt-1 flex items-start gap-1">
                  <XCircle className="w-3 h-3 mt-0.5 shrink-0" /> {parseResult.error}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleParse}
                className="flex-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-sm text-white flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> Parse
              </button>
              <button
                onClick={handleBuildNFA}
                disabled={!parseResult?.ast || !!parseResult?.error}
                className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded-lg text-xs text-slate-300 flex items-center justify-center gap-1.5"
              >
                Build ε-NFA
              </button>
            </div>

            {enfaBuilt && (
              <div className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> ε-NFA loaded into canvas
              </div>
            )}

            {/* Parsed RE summary */}
            {parseResult?.ast && !parseResult.error && (
              <div className="bg-slate-900 rounded-lg p-2 border border-slate-700">
                <div className="text-xs text-slate-500 mb-1">Parsed as:</div>
                <div className="text-sm font-mono text-amber-300">{astToString(parseResult.ast)}</div>
              </div>
            )}
          </div>

          {/* Preset examples */}
          <div className="border-t border-slate-700 px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <BookOpen className="inline w-3 h-3 mr-1" />Examples
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => handlePreset(p)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all group
                  ${regexInput === p.re ? 'border-emerald-500/60 bg-emerald-900/20 text-emerald-300' : 'border-slate-700 hover:border-slate-600 text-slate-400'}`}
              >
                <div className="font-semibold">{p.label}</div>
                <div className="font-mono text-slate-600 group-hover:text-slate-500 text-xs">{p.re}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: AST Tree */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-slate-800/60 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Parse Tree (AST)
          </div>
          <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
            {parseResult?.ast && !parseResult.error ? (
              <div className="mt-4">
                <ASTNode node={parseResult.ast} />
                {/* Legend */}
                <div className="mt-8 flex flex-wrap gap-2 justify-center">
                  {Object.entries(NODE_COLORS).map(([type, cls]) => (
                    <div key={type} className={`text-xs px-2 py-0.5 rounded border font-mono ${cls}`}>
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-slate-600 text-sm text-center mt-12">
                <p className="text-3xl mb-3">🌳</p>
                <p>Enter a regular expression and press Parse</p>
                <p className="text-xs mt-2">to see its Abstract Syntax Tree</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: String Tester */}
        <div className="w-72 border-l border-slate-700 flex flex-col">
          <div className="px-3 py-2 bg-slate-800/60 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Language Tester
          </div>

          <div className="p-3 border-b border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTest}
                onChange={e => setNewTest(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTestString()}
                placeholder="Add test string…"
                className="flex-1 text-xs bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button onClick={addTestString} className="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300">
                + Add
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {testStrings.map((str, i) => {
              const result = testResult(str);
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono ${
                    result === null   ? 'border-slate-700 text-slate-500'
                    : result          ? 'border-emerald-600/50 bg-emerald-900/20 text-emerald-300'
                    :                   'border-rose-600/50 bg-rose-900/20 text-rose-400'
                  }`}
                >
                  <span>"{str === '' ? 'ε' : str}"</span>
                  <div className="flex items-center gap-2">
                    {result === null ? (
                      <span className="text-slate-600">—</span>
                    ) : result ? (
                      <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="w-3 h-3" /> accept</span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400"><XCircle className="w-3 h-3" /> reject</span>
                    )}
                    <button onClick={() => setTestStrings(prev => prev.filter((_, j) => j !== i))}
                      className="text-slate-700 hover:text-slate-500 ml-1">×</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {parseResult?.ast && !parseResult.error && (
            <div className="border-t border-slate-700 p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Accepted: {accepted.length}
                </span>
                <span className="text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Rejected: {rejected.length}
                </span>
              </div>

              {/* Quick membership test */}
              <div className="text-xs text-slate-600 bg-slate-900 rounded p-2 space-y-1">
                <div className="text-slate-500 font-semibold">Sample accepted:</div>
                {accepted.slice(0, 3).map((s, i) => (
                  <div key={i} className="text-emerald-600 font-mono">"{s === '' ? 'ε' : s}"</div>
                ))}
                {accepted.length === 0 && <div className="text-slate-700">none in test set</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
