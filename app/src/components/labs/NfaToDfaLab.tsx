import { useState } from 'react';
import type { Automaton } from '../../core/automata/types';
import { subsetConstruction, subsetKey } from '../../core/automata/nfaToDfa';
import { epsilonClosure, move } from '../../core/automata/simulation';
import { simulateString } from '../../core/automata/simulation';
import { useStore } from '../../store/useStore';
import { Play, ChevronRight, RefreshCw, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

// ─── Pre-built example NFA: strings ending in "01" ───────
const EXAMPLE_NFA: Automaton = {
  type: 'NFA',
  alphabet: ['0', '1'],
  states: [
    { id: 'q0', label: 'q0', x: 130, y: 200, initial: true,  accepting: false },
    { id: 'q1', label: 'q1', x: 310, y: 200, initial: false, accepting: false },
    { id: 'q2', label: 'q2', x: 490, y: 200, initial: false, accepting: true  },
  ],
  transitions: [
    { id: 't1', from: 'q0', to: 'q0', symbols: ['0','1'] },
    { id: 't2', from: 'q0', to: 'q1', symbols: ['0'] },
    { id: 't3', from: 'q1', to: 'q2', symbols: ['1'] },
  ],
  initialState: 'q0'
};

interface SubsetRow {
  subsetId: string;
  subset: string[];
  label: string;
  isAccepting: boolean;
  transitions: Record<string, string[]>; // symbol → next subset
  computed: boolean;
}

const stateLabels = (nfa: Automaton, ids: string[]) =>
  ids.map(id => nfa.states.find(s => s.id === id)?.label ?? id);

export const NfaToDfaLab = () => {
  const { setAutomaton } = useStore();

  // NFA being converted — starts with example
  const [nfa, _setNfa] = useState<Automaton>(EXAMPLE_NFA);

  // Subset construction workspace
  const [subsetRows, setSubsetRows] = useState<SubsetRow[]>([]);
  const [started, setStarted] = useState(false);

  // Result DFA
  const [resultDfa, setResultDfa] = useState<Automaton | null>(null);

  // Student input for guided mode
  const [pendingInput, setPendingInput] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, { ok: boolean; msg: string }>>({});

  // Test string
  const [testString, setTestString] = useState('101');
  const [nfaResult, setNfaResult]     = useState<{ accepted: boolean; path: string[] } | null>(null);
  const [dfaResult, setDfaResult]     = useState<{ accepted: boolean; path: string[] } | null>(null);

  // ── Start construction ───────────────────────────────────
  const handleStart = () => {
    const alphabet = nfa.alphabet.filter(s => s !== 'ε');
    const initials = nfa.states.filter(s => s.initial).map(s => s.id);
    const startSubset = nfa.type === 'ENFA' ? epsilonClosure(initials, nfa) : initials;
    const isAccepting = startSubset.some(id => nfa.states.find(s => s.id === id)?.accepting);
    const labels = stateLabels(nfa, startSubset);

    const firstRow: SubsetRow = {
      subsetId: subsetKey(startSubset),
      subset: startSubset,
      label: '{' + labels.join(',') + '}',
      isAccepting,
      transitions: Object.fromEntries(alphabet.map(sym => [sym, []])),
      computed: false,
    };

    setSubsetRows([firstRow]);
    setStarted(true);
    setResultDfa(null);
    setFeedback({});
    setPendingInput({});
  };

  // ── Student submits a transition for a row/symbol ────────
  const handleCheck = (rowId: string, symbol: string) => {
    const key = `${rowId}|${symbol}`;
    const input = pendingInput[key] ?? '';
    const row = subsetRows.find(r => r.subsetId === rowId)!;

    // Compute the correct answer
    const moved = move(row.subset, symbol, nfa);
    const correct = nfa.type === 'ENFA' ? epsilonClosure(moved, nfa) : moved;
    const correctKey = subsetKey(correct);

    // Student entered a comma-separated list of NFA state labels
    const entered = input.split(',').map(s => s.trim()).filter(Boolean);
    const enteredIds = entered.map(lbl => nfa.states.find(s => s.label === lbl)?.id).filter(Boolean) as string[];
    const enteredKey = subsetKey(enteredIds);

    const ok = enteredKey === correctKey;
    const correctLabels = stateLabels(nfa, correct);
    const msg = ok
      ? `Correct! Move({${stateLabels(nfa, row.subset).join(',')}}, ${symbol}) ${nfa.type === 'ENFA' ? '+ ε-closure' : ''} = {${correctLabels.join(',') || '∅'}}`
      : `Not quite. ${
          nfa.type === 'ENFA'
            ? `First compute Move = {${stateLabels(nfa, moved).join(',') || '∅'}}, then ε-closure = {${correctLabels.join(',') || '∅'}}.`
            : `Move({${stateLabels(nfa, row.subset).join(',')}}, ${symbol}) = {${correctLabels.join(',') || '∅'}}.`
        }`;

    setFeedback(prev => ({ ...prev, [key]: { ok, msg } }));

    if (ok) {
      // Update the row
      const updatedRows = subsetRows.map(r =>
        r.subsetId === rowId
          ? { ...r, transitions: { ...r.transitions, [symbol]: correct } }
          : r
      );

      // Check if this subset is new — if so, add a row for it
      const alphabet = nfa.alphabet.filter(s => s !== 'ε');
      const isNewSubset = correct.length > 0 && !updatedRows.find(r => r.subsetId === correctKey);
      if (isNewSubset) {
        const isAcc = correct.some(id => nfa.states.find(s => s.id === id)?.accepting);
        const labels = stateLabels(nfa, correct);
        updatedRows.push({
          subsetId: correctKey,
          subset: correct,
          label: '{' + labels.join(',') + '}',
          isAccepting: isAcc,
          transitions: Object.fromEntries(alphabet.map(sym => [sym, []])),
          computed: false,
        });
      }

      setSubsetRows(updatedRows);
    }
  };

  // ── Auto-complete ────────────────────────────────────────
  const handleAutoComplete = () => {
    const { dfa, dfaStateToNfaStates } = subsetConstruction(nfa);
    const alphabet = nfa.alphabet.filter(s => s !== 'ε');

    // Build rows from result
    const rows: SubsetRow[] = dfa.states.map(ds => {
      const nfaIds = dfaStateToNfaStates[ds.id];
      const labels = stateLabels(nfa, nfaIds);
      const transitions: Record<string, string[]> = {};
      for (const sym of alphabet) {
        const transId = dfa.transitions.find(t => t.from === ds.id && t.symbols.includes(sym))?.to;
        transitions[sym] = transId ? (dfaStateToNfaStates[transId] ?? []) : [];
      }
      return {
        subsetId: subsetKey(nfaIds),
        subset: nfaIds,
        label: '{' + labels.join(',') + '}',
        isAccepting: ds.accepting,
        transitions,
        computed: true,
      };
    });

    setSubsetRows(rows);
    setResultDfa(dfa);
    setAutomaton(dfa);
  };

  // ── Finalise DFA from current rows ──────────────────────
  const handleFinalize = () => {
    const { dfa } = subsetConstruction(nfa);
    setResultDfa(dfa);
    setAutomaton(dfa);
  };

  // ── Test string ──────────────────────────────────────────
  const handleTest = () => {
    setNfaResult(simulateString(nfa, testString));
    if (resultDfa) setDfaResult(simulateString(resultDfa, testString));
  };

  const alphabet = nfa.alphabet.filter(s => s !== 'ε');

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
      {/* Header */}
      <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-4 shrink-0">
        <span className="font-bold text-cyan-400 text-sm">NFA → DFA Laboratory</span>
        <span className="text-xs text-slate-500">Subset Construction</span>
        <div className="ml-auto flex items-center gap-2">
          {!started ? (
            <button onClick={handleStart} className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium text-white flex items-center gap-2">
              <Play className="w-4 h-4" /> Start Construction
            </button>
          ) : (
            <>
              <button onClick={handleAutoComplete} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" /> Auto-Complete
              </button>
              {subsetRows.length > 0 && (
                <button onClick={handleFinalize} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Generate DFA
                </button>
              )}
              <button onClick={() => { setStarted(false); setSubsetRows([]); setResultDfa(null); setFeedback({}); }} className="p-1.5 text-slate-500 hover:text-slate-300">
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: NFA Canvas */}
        <div className="w-80 flex flex-col border-r border-slate-700">
          <div className="px-3 py-2 bg-slate-800/60 border-b border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Original NFA</p>
          </div>
          <div className="flex-1 relative">
            {/* Read-only NFA canvas — show the pre-loaded NFA */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <marker id="arr-nfa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                </marker>
              </defs>

              {/* Edges */}
              {nfa.transitions.map(t => {
                const f = nfa.states.find(s => s.id === t.from)!;
                const to = nfa.states.find(s => s.id === t.to)!;
                if (!f || !to) return null;
                const isSelf = f.id === to.id;
                if (isSelf) return (
                  <g key={t.id}>
                    <path d={`M ${f.x-10} ${f.y-20} C ${f.x-40} ${f.y-70}, ${f.x+40} ${f.y-70}, ${f.x+10} ${f.y-20}`} fill="none" stroke="#334155" strokeWidth="2" markerEnd="url(#arr-nfa)" />
                    <text x={f.x} y={f.y - 48} textAnchor="middle" fill="#64748b" fontSize="11">{t.symbols.join(',')}</text>
                  </g>
                );
                const dx = to.x - f.x; const dy = to.y - f.y; const len = Math.sqrt(dx*dx+dy*dy);
                const nx = len ? dx/len : 0; const ny = len ? dy/len : 0;
                return (
                  <g key={t.id}>
                    <line x1={f.x+nx*24} y1={f.y+ny*24} x2={to.x-nx*24} y2={to.y-ny*24} stroke="#334155" strokeWidth="2" markerEnd="url(#arr-nfa)" />
                    <text x={(f.x+to.x)/2} y={(f.y+to.y)/2-10} textAnchor="middle" fill="#64748b" fontSize="11">{t.symbols.join(',')}</text>
                  </g>
                );
              })}

              {/* States */}
              {nfa.states.map(s => (
                <g key={s.id} transform={`translate(${s.x},${s.y})`}>
                  {s.initial && <path d="M -50 0 L -24 0" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arr-nfa)" />}
                  <circle r="24" fill="#0f172a" stroke={s.initial ? '#3b82f6' : '#334155'} strokeWidth="2" />
                  {s.accepting && <circle r="20" fill="none" stroke="#334155" strokeWidth="1.5" />}
                  <text textAnchor="middle" dy="5" fill="#94a3b8" fontSize="13" fontWeight="600">{s.label}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* NFA info panel */}
          <div className="border-t border-slate-700 p-3 text-xs text-slate-500 space-y-1">
            <div>States: {nfa.states.map(s => s.label).join(', ')}</div>
            <div>Alphabet: {nfa.alphabet.join(', ')}</div>
            <div>Start: {nfa.states.find(s => s.initial)?.label}</div>
            <div>Accept: {nfa.states.filter(s => s.accepting).map(s => s.label).join(', ')}</div>
          </div>
        </div>

        {/* Center: Subset Construction Table */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-slate-800/60 border-b border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Subset Construction Workspace
              {started && <span className="ml-2 text-slate-600 normal-case font-normal">— Enter NFA state labels (comma-separated) for each transition</span>}
            </p>
          </div>

          {!started ? (
            <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
              Press "Start Construction" to begin
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-2 px-3 text-left text-slate-400 font-semibold">DFA State (NFA subset)</th>
                    {alphabet.map(sym => (
                      <th key={sym} className="py-2 px-3 text-left text-slate-400 font-semibold">On '{sym}'</th>
                    ))}
                    <th className="py-2 px-3 text-left text-slate-400 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {subsetRows.map(row => (
                    <tr key={row.subsetId} className="border-b border-slate-800 hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <span className={`font-mono text-sm font-semibold ${row.isAccepting ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {row.label}
                        </span>
                      </td>

                      {alphabet.map(sym => {
                        const key = `${row.subsetId}|${sym}`;
                        const fb = feedback[key];
                        const computed = row.computed || (row.transitions[sym]?.length > 0 && fb?.ok);
                        const resultLabels = computed
                          ? stateLabels(nfa, row.transitions[sym])
                          : null;

                        return (
                          <td key={sym} className="py-2 px-3">
                            {computed ? (
                              <span className="font-mono text-slate-400 text-xs">
                                {'{' + (resultLabels?.join(',') || '∅') + '}'}
                              </span>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <div className="flex gap-1">
                                  <input
                                    type="text"
                                    placeholder={`e.g. q0,q1`}
                                    value={pendingInput[key] ?? ''}
                                    onChange={e => setPendingInput(prev => ({ ...prev, [key]: e.target.value }))}
                                    onKeyDown={e => e.key === 'Enter' && handleCheck(row.subsetId, sym)}
                                    className="w-24 text-xs bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                                  />
                                  <button
                                    onClick={() => handleCheck(row.subsetId, sym)}
                                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300"
                                  >
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                </div>
                                {fb && (
                                  <div className={`flex items-start gap-1 text-xs ${fb.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {fb.ok ? <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" /> : <XCircle className="w-3 h-3 mt-0.5 shrink-0" />}
                                    <span>{fb.msg}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-2 px-3">
                        <div className="flex gap-1 flex-wrap">
                          {subsetRows.find(r => r.subsetId === row.subsetId)?.subset.length === 0
                            ? <span className="text-xs text-slate-600 bg-slate-800 rounded px-1.5 py-0.5">dead</span>
                            : <>
                              {nfa.states.find(s => s.initial && row.subset.includes(s.id)) &&
                                <span className="text-xs text-blue-400 bg-blue-900/30 rounded px-1.5 py-0.5">→ start</span>}
                              {row.isAccepting &&
                                <span className="text-xs text-emerald-400 bg-emerald-900/30 rounded px-1.5 py-0.5">* accept</span>}
                            </>
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {subsetRows.length > 0 && (
                <p className="text-xs text-slate-600 mt-4">
                  Tip: States marked with * are accepting (they contain an NFA accepting state).
                  {nfa.type === 'ENFA' ? ' ε-closure is computed automatically.' : ''}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Result DFA + Comparison */}
        <div className="w-72 border-l border-slate-700 flex flex-col">
          <div className="px-3 py-2 bg-slate-800/60 border-b border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Result DFA</p>
          </div>

          {resultDfa ? (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <div className="text-xs text-slate-400 space-y-1">
                  <div><span className="text-slate-600">States:</span> {resultDfa.states.length}</div>
                  <div><span className="text-slate-600">Accept:</span> {resultDfa.states.filter(s => s.accepting).map(s => s.label).join(', ')}</div>
                </div>

                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="py-1 px-1 text-left text-slate-500">State</th>
                      {alphabet.map(sym => <th key={sym} className="py-1 px-1 text-slate-500">{sym}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {resultDfa.states.map(ds => (
                      <tr key={ds.id} className="border-b border-slate-800">
                        <td className={`py-1 px-1 font-mono ${ds.accepting ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {ds.initial ? '→' : ''}{ds.accepting ? '*' : ''}{ds.label}
                        </td>
                        {alphabet.map(sym => {
                          const dest = resultDfa.transitions.find(t => t.from === ds.id && t.symbols.includes(sym))?.to;
                          const destLabel = resultDfa.states.find(s => s.id === dest)?.label ?? '–';
                          return <td key={sym} className="py-1 px-1 text-slate-500 font-mono text-center">{destLabel}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Language equivalence tester */}
              <div className="border-t border-slate-700 p-3">
                <p className="text-xs text-slate-500 mb-2">Verify equivalence:</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={testString}
                    onChange={e => setTestString(e.target.value)}
                    className="flex-1 text-xs bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="Test string"
                  />
                  <button onClick={handleTest} className="px-2 py-1 bg-cyan-700 hover:bg-cyan-600 rounded text-xs text-white">Run</button>
                </div>
                {nfaResult && (
                  <div className="space-y-1">
                    <div className={`text-xs flex items-center gap-1 ${nfaResult.accepted ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {nfaResult.accepted ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      NFA: {nfaResult.accepted ? 'Accepted' : 'Rejected'}
                    </div>
                    {dfaResult && (
                      <div className={`text-xs flex items-center gap-1 ${dfaResult.accepted ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {dfaResult.accepted ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        DFA: {dfaResult.accepted ? 'Accepted' : 'Rejected'}
                      </div>
                    )}
                    {dfaResult && (
                      <div className={`text-xs mt-1 font-semibold ${nfaResult.accepted === dfaResult.accepted ? 'text-emerald-400' : 'text-rose-500'}`}>
                        {nfaResult.accepted === dfaResult.accepted ? '✓ Results match' : '✗ Mismatch — check construction!'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-600 text-xs text-center px-4">
              Complete the subset table and click "Generate DFA" to see the result here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
