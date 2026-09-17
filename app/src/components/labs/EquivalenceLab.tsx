import { useState } from 'react';
import type { Automaton } from '../../core/automata/types';
import { productConstruction, formatProductState } from '../../core/automata/equivalence';
import { useStore } from '../../store/useStore';
import { Play, CheckCircle, XCircle, BookOpen, RefreshCw } from 'lucide-react';

// ─── Preset Examples ─────────────────────────────────────────────────────────

const PRESET_EVEN_1S_MIN: Automaton = {
  type: 'DFA', alphabet: ['0', '1'],
  states: [
    { id: 'q0', label: 'E', x: 100, y: 150, initial: true, accepting: true },
    { id: 'q1', label: 'O', x: 250, y: 150, initial: false, accepting: false },
  ],
  transitions: [
    { id: 't1', from: 'q0', to: 'q0', symbols: ['0'] },
    { id: 't2', from: 'q0', to: 'q1', symbols: ['1'] },
    { id: 't3', from: 'q1', to: 'q1', symbols: ['0'] },
    { id: 't4', from: 'q1', to: 'q0', symbols: ['1'] },
  ],
  initialState: 'q0'
};

const PRESET_EVEN_1S_REDUNDANT: Automaton = {
  type: 'DFA', alphabet: ['0', '1'],
  states: [
    { id: 'A', label: 'A', x: 50, y: 100, initial: true, accepting: true },
    { id: 'B', label: 'B', x: 200, y: 50, initial: false, accepting: false },
    { id: 'C', label: 'C', x: 350, y: 100, initial: false, accepting: true },
    { id: 'D', label: 'D', x: 200, y: 150, initial: false, accepting: false },
  ],
  transitions: [
    { id: 't1', from: 'A', to: 'A', symbols: ['0'] },
    { id: 't2', from: 'A', to: 'B', symbols: ['1'] },
    { id: 't3', from: 'B', to: 'B', symbols: ['0'] },
    { id: 't4', from: 'B', to: 'C', symbols: ['1'] },
    { id: 't5', from: 'C', to: 'C', symbols: ['0'] },
    { id: 't6', from: 'C', to: 'D', symbols: ['1'] },
    { id: 't7', from: 'D', to: 'D', symbols: ['0'] },
    { id: 't8', from: 'D', to: 'A', symbols: ['1'] },
  ],
  initialState: 'A'
};

const PRESET_ODD_1S: Automaton = {
  type: 'DFA', alphabet: ['0', '1'],
  states: [
    { id: 's0', label: 's0', x: 100, y: 150, initial: true, accepting: false },
    { id: 's1', label: 's1', x: 250, y: 150, initial: false, accepting: true },
  ],
  transitions: [
    { id: 't1', from: 's0', to: 's0', symbols: ['0'] },
    { id: 't2', from: 's0', to: 's1', symbols: ['1'] },
    { id: 't3', from: 's1', to: 's1', symbols: ['0'] },
    { id: 't4', from: 's1', to: 's0', symbols: ['1'] },
  ],
  initialState: 's0'
};

const PRESETS = [
  { label: 'Equivalent (Even 1s vs Redundant)', a: PRESET_EVEN_1S_MIN, b: PRESET_EVEN_1S_REDUNDANT },
  { label: 'Not Equivalent (Even vs Odd 1s)', a: PRESET_EVEN_1S_MIN, b: PRESET_ODD_1S },
];

export const EquivalenceLab = () => {
  const { setAutomaton } = useStore();
  const [dfaA, setDfaA] = useState<Automaton>(PRESETS[0].a);
  const [dfaB, setDfaB] = useState<Automaton>(PRESETS[0].b);
  const [result, setResult] = useState<ReturnType<typeof productConstruction> | null>(null);

  const handleRun = () => {
    setResult(productConstruction(dfaA, dfaB));
  };

  const handleReset = () => {
    setResult(null);
  };

  const loadPreset = (idx: number) => {
    setDfaA(PRESETS[idx].a);
    setDfaB(PRESETS[idx].b);
    setResult(null);
  };

  // ── Render small preview SVG ──
  const renderPreview = (dfa: Automaton, color: string) => {
    return (
      <svg className="w-full h-40 bg-slate-800 rounded-lg border border-slate-700">
        <defs>
          <marker id={`arr-eq-${color}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        </defs>
        <g transform="scale(0.8) translate(30, 20)">
          {dfa.transitions.map((t, i) => {
            const f = dfa.states.find(s => s.id === t.from)!;
            const to = dfa.states.find(s => s.id === t.to)!;
            if (!f || !to) return null;
            if (f.id === to.id) {
              return (
                <g key={i}>
                  <path d={`M ${f.x-10} ${f.y-20} C ${f.x-40} ${f.y-60}, ${f.x+40} ${f.y-60}, ${f.x+10} ${f.y-20}`}
                    fill="none" stroke={color} strokeWidth="1.5" markerEnd={`url(#arr-eq-${color})`} />
                  <text x={f.x} y={f.y - 45} textAnchor="middle" fill="#94a3b8" fontSize="10">{t.symbols.join(',')}</text>
                </g>
              );
            }
            const dx = to.x - f.x; const dy = to.y - f.y; const len = Math.sqrt(dx*dx+dy*dy)||1;
            const nx = dx/len; const ny = dy/len;
            return (
              <g key={i}>
                <line x1={f.x+nx*20} y1={f.y+ny*20} x2={to.x-nx*20} y2={to.y-ny*20} stroke={color} strokeWidth="1.5" markerEnd={`url(#arr-eq-${color})`} />
                <text x={(f.x+to.x)/2} y={(f.y+to.y)/2-8} textAnchor="middle" fill="#94a3b8" fontSize="10">{t.symbols.join(',')}</text>
              </g>
            );
          })}
          {dfa.states.map(s => (
            <g key={s.id} transform={`translate(${s.x},${s.y})`}>
              {s.initial && <path d="M -40 0 L -20 0" stroke={color} strokeWidth="1.5" markerEnd={`url(#arr-eq-${color})`} />}
              <circle r="20" fill="#0f172a" stroke={color} strokeWidth="2" />
              {s.accepting && <circle r="16" fill="none" stroke={color} strokeWidth="1" />}
              <text textAnchor="middle" dy="4" fill="#e2e8f0" fontSize="12" fontWeight="600">{s.label}</text>
            </g>
          ))}
        </g>
      </svg>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
      <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-4 shrink-0">
        <span className="font-bold text-fuchsia-400 text-sm">Equivalence Arena</span>
        <span className="text-xs text-slate-500">Product Construction</span>
        <div className="ml-auto flex gap-2">
          {!result ? (
            <button onClick={handleRun} className="px-4 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-lg text-sm font-medium text-white flex items-center gap-2">
              <Play className="w-4 h-4" /> Check Equivalence
            </button>
          ) : (
            <button onClick={handleReset} className="p-1.5 text-slate-500 hover:text-slate-300"><RefreshCw className="w-4 h-4" /></button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: DFAs */}
        <div className="w-80 border-r border-slate-700 flex flex-col overflow-y-auto">
          <div className="p-4 space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">DFA A</div>
              {renderPreview(dfaA, '#3b82f6')}
              <button onClick={() => setAutomaton(dfaA)} className="mt-2 text-xs text-blue-400 hover:text-blue-300">Load into main canvas →</button>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">DFA B</div>
              {renderPreview(dfaB, '#a855f7')}
              <button onClick={() => setAutomaton(dfaB)} className="mt-2 text-xs text-fuchsia-400 hover:text-fuchsia-300">Load into main canvas →</button>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><BookOpen className="w-3 h-3"/> Test Cases</div>
              <div className="space-y-2">
                {PRESETS.map((p, i) => (
                  <button key={i} onClick={() => loadPreset(i)} className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 border border-slate-700 hover:border-slate-500 transition-colors">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product Construction Result */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-slate-800/60 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Product DFA (A × B)
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <p className="text-4xl mb-4">⚖️</p>
                <p>Click "Check Equivalence" to run the product construction.</p>
                <p className="text-xs mt-2 text-slate-600 max-w-sm text-center">
                  The algorithm builds a new DFA where each state is a pair (q<sub>A</sub>, q<sub>B</sub>). If it ever reaches a state where one accepts and the other rejects, they are not equivalent.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Result Header */}
                <div className={`p-4 rounded-xl border ${result.equivalent ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-rose-900/20 border-rose-500/50'}`}>
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${result.equivalent ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.equivalent ? <CheckCircle className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>}
                    {result.equivalent ? 'Equivalent!' : 'Not Equivalent!'}
                  </h3>
                  {!result.equivalent && result.distinguishingString !== null && (
                    <div className="mt-3 text-sm text-slate-300">
                      <p>Found a distinguishing string (shortest path via BFS):</p>
                      <div className="mt-2 font-mono bg-rose-950/50 border border-rose-900 rounded p-2 text-rose-300 inline-block">
                        "{result.distinguishingString === '' ? 'ε (empty string)' : result.distinguishingString}"
                      </div>
                      <p className="mt-2 text-xs text-rose-400/80">
                        At state {formatProductState(result.distinguishingState!, dfaA, dfaB)}, one machine accepts while the other rejects.
                      </p>
                    </div>
                  )}
                  {result.equivalent && (
                    <p className="mt-2 text-sm text-emerald-400/80">
                      No reachable state exists where one machine accepts and the other rejects.
                    </p>
                  )}
                </div>

                {/* Reachable Product States Table */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Reachable Product States ({result.reachable.length})</h4>
                  <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-900/50">
                        <tr>
                          <th className="px-4 py-2 font-medium text-slate-400">State (A, B)</th>
                          <th className="px-4 py-2 font-medium text-slate-400">A Accepts?</th>
                          <th className="px-4 py-2 font-medium text-slate-400">B Accepts?</th>
                          <th className="px-4 py-2 font-medium text-slate-400">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {result.reachable.map((ps, i) => {
                          const aAcc = dfaA.states.find(s => s.id === ps.idA)?.accepting ?? false;
                          const bAcc = dfaB.states.find(s => s.id === ps.idB)?.accepting ?? false;
                          const conflict = aAcc !== bAcc;
                          return (
                            <tr key={ps.key} className={conflict ? 'bg-rose-950/30' : 'hover:bg-slate-800/50'}>
                              <td className="px-4 py-2 font-mono text-slate-300">
                                {i === 0 && '→ '}
                                {formatProductState(ps, dfaA, dfaB)}
                              </td>
                              <td className={`px-4 py-2 ${aAcc ? 'text-emerald-400' : 'text-slate-500'}`}>{aAcc ? 'Yes' : 'No'}</td>
                              <td className={`px-4 py-2 ${bAcc ? 'text-emerald-400' : 'text-slate-500'}`}>{bAcc ? 'Yes' : 'No'}</td>
                              <td className="px-4 py-2">
                                {conflict ? (
                                  <span className="text-rose-400 font-semibold flex items-center gap-1"><XCircle className="w-3 h-3"/> Conflict</span>
                                ) : (
                                  <span className="text-emerald-400/70">Match</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
