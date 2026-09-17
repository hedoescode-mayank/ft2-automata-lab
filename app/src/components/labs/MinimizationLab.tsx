import { useState } from 'react';
import type { Automaton } from '../../core/automata/types';
import {
  runMinimization, reachableStates, refinePartition, findDistinguishingSymbol,
} from '../../core/automata/minimization';
import type { Partition } from '../../core/automata/minimization';
import { simulateString } from '../../core/automata/simulation';
import { useStore } from '../../store/useStore';
import { Play, RefreshCw, ChevronRight, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

// ─── Example DFA with redundant states ───────────────────────────────────────
const EXAMPLE_DFA: Automaton = {
  type: 'DFA',
  alphabet: ['0', '1'],
  states: [
    { id: 'A', label: 'A', x: 100, y: 180, initial: true,  accepting: false },
    { id: 'B', label: 'B', x: 280, y: 100, initial: false, accepting: true  },
    { id: 'C', label: 'C', x: 280, y: 260, initial: false, accepting: false },
    { id: 'D', label: 'D', x: 460, y: 180, initial: false, accepting: true  },
    { id: 'E', label: 'E', x: 460, y: 340, initial: false, accepting: false }, // unreachable
  ],
  transitions: [
    { id: 't1', from: 'A', to: 'B', symbols: ['0'] },
    { id: 't2', from: 'A', to: 'C', symbols: ['1'] },
    { id: 't3', from: 'B', to: 'B', symbols: ['0'] },
    { id: 't4', from: 'B', to: 'D', symbols: ['1'] },
    { id: 't5', from: 'C', to: 'B', symbols: ['0'] },
    { id: 't6', from: 'C', to: 'C', symbols: ['1'] },
    { id: 't7', from: 'D', to: 'B', symbols: ['0'] },
    { id: 't8', from: 'D', to: 'D', symbols: ['1'] },
    { id: 't9', from: 'E', to: 'E', symbols: ['0', '1'] }, // unreachable
  ],
  initialState: 'A'
};

type Stage = 'idle' | 'unreachable' | 'partition' | 'refine' | 'done';

const GROUP_COLORS = [
  'border-cyan-500/60 bg-cyan-900/20',
  'border-violet-500/60 bg-violet-900/20',
  'border-amber-500/60 bg-amber-900/20',
  'border-emerald-500/60 bg-emerald-900/20',
  'border-rose-500/60 bg-rose-900/20',
  'border-sky-500/60 bg-sky-900/20',
  'border-fuchsia-500/60 bg-fuchsia-900/20',
];
const BADGE_COLORS = [
  'bg-cyan-900/50 text-cyan-300 border-cyan-600',
  'bg-violet-900/50 text-violet-300 border-violet-600',
  'bg-amber-900/50 text-amber-300 border-amber-600',
  'bg-emerald-900/50 text-emerald-300 border-emerald-600',
  'bg-rose-900/50 text-rose-300 border-rose-600',
  'bg-sky-900/50 text-sky-300 border-sky-600',
  'bg-fuchsia-900/50 text-fuchsia-300 border-fuchsia-600',
];

export const MinimizationLab = () => {
  const { setAutomaton } = useStore();
  const [dfa] = useState<Automaton>(EXAMPLE_DFA);
  const [stage, setStage] = useState<Stage>('idle');

  // Stage 1: which states has the student marked as unreachable?
  const [markedUnreachable, setMarkedUnreachable] = useState<Set<string>>(new Set());
  const [unreachFeedback, setUnreachFeedback] = useState<string | null>(null);

  // Stage 2 & 3: partition
  const [partition, setPartition] = useState<Partition>([]);
  const [partitionStep, setPartitionStep] = useState(0);
  const [stepMessages, setStepMessages] = useState<{ ok: boolean; msg: string }[]>([]);

  // Stage 4: result
  const [minimized, setMinimized] = useState<Automaton | null>(null);

  // Test comparison
  const [testStr, setTestStr] = useState('101');
  const [origResult, setOrigResult] = useState<boolean | null>(null);
  const [minResult,  setMinResult]  = useState<boolean | null>(null);

  const reachable = reachableStates(dfa);
  const unreachableIds = dfa.states.filter(s => !reachable.has(s.id)).map(s => s.id);

  // ── Stage helpers ────────────────────────────────────────────────────────────
  const handleStart = () => {
    setStage('unreachable');
    setMarkedUnreachable(new Set());
    setUnreachFeedback(null);
  };

  const toggleUnreachable = (id: string) => {
    setMarkedUnreachable(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const checkUnreachable = () => {
    const correctSet = new Set(unreachableIds);
    const markedSet  = markedUnreachable;

    const missed   = unreachableIds.filter(id => !markedSet.has(id));
    const wrongly  = [...markedSet].filter(id => !correctSet.has(id));

    if (missed.length === 0 && wrongly.length === 0) {
      setUnreachFeedback('✓ Correct! All unreachable states identified.');
      // advance after short delay
      setTimeout(() => setStage('partition'), 600);
      // Build P0
      const cleanStates = dfa.states.filter(s => reachable.has(s.id));
      const accepting    = cleanStates.filter(s => s.accepting).map(s => s.id);
      const nonAccepting = cleanStates.filter(s => !s.accepting).map(s => s.id);
      const p0: Partition = [];
      if (accepting.length)    p0.push(accepting);
      if (nonAccepting.length) p0.push(nonAccepting);
      setPartition(p0);
      setPartitionStep(0);
      setStepMessages([]);
    } else {
      const msgs: string[] = [];
      if (missed.length)  msgs.push(`Missed: ${missed.map(id => dfa.states.find(s=>s.id===id)?.label).join(', ')}.`);
      if (wrongly.length) msgs.push(`Wrongly marked: ${wrongly.map(id => dfa.states.find(s=>s.id===id)?.label).join(', ')}.`);
      msgs.push('Tip: A state is unreachable if no path from the start state leads to it.');
      setUnreachFeedback(msgs.join(' '));
    }
  };

  const handleRefineStep = () => {
    const cleanDfa = {
      ...dfa,
      states: dfa.states.filter(s => reachable.has(s.id)),
      transitions: dfa.transitions.filter(t => reachable.has(t.from) && reachable.has(t.to)),
    };
    const next = refinePartition(cleanDfa, partition);
    const changed = JSON.stringify(
      partition.map(g => [...g].sort())
    ) !== JSON.stringify(
      next.map(g => [...g].sort())
    );

    if (changed) {
      // Find what split and why
      const msgs: { ok: boolean; msg: string }[] = [];
      for (const oldGroup of partition) {
        if (oldGroup.length < 2) continue;
        for (let i = 0; i < oldGroup.length; i++) {
          for (let j = i + 1; j < oldGroup.length; j++) {
            const sym = findDistinguishingSymbol(cleanDfa, oldGroup[i], oldGroup[j], partition);
            if (sym) {
              const li = cleanDfa.states.find(s => s.id === oldGroup[i])?.label ?? oldGroup[i];
              const lj = cleanDfa.states.find(s => s.id === oldGroup[j])?.label ?? oldGroup[j];
              const ti = cleanDfa.transitions.find(t => t.from === oldGroup[i] && t.symbols.includes(sym))?.to;
              const tj = cleanDfa.transitions.find(t => t.from === oldGroup[j] && t.symbols.includes(sym))?.to;
              const li2 = cleanDfa.states.find(s => s.id === ti)?.label ?? '∅';
              const lj2 = cleanDfa.states.find(s => s.id === tj)?.label ?? '∅';
              msgs.push({
                ok: false,
                msg: `${li} and ${lj} are distinguishable: on symbol '${sym}', ${li}→${li2} and ${lj}→${lj2} land in different groups.`
              });
            }
          }
        }
      }
      setStepMessages(prev => [...prev, ...msgs]);
      setPartition(next);
      setPartitionStep(p => p + 1);
      setStage('refine');
    } else {
      setStepMessages(prev => [...prev, { ok: true, msg: 'Partition is stable — no further splits possible. Algorithm complete!' }]);
      setStage('done');
      setPartition(next);
      // Build and store minimized DFA
      const { minimizedDfa } = runMinimization(dfa);
      setMinimized(minimizedDfa);
      setAutomaton(minimizedDfa);
    }
  };

  const handleAutoSolve = () => {
    const { steps, finalPartition, minimizedDfa } = runMinimization(dfa);
    const msgs = steps.slice(1).map(s => ({ ok: !s.splitOccurred, msg: s.description }));
    setPartition(finalPartition);
    setStepMessages(msgs);
    setPartitionStep(steps.length - 1);
    setMinimized(minimizedDfa);
    setAutomaton(minimizedDfa);
    setStage('done');
  };

  const handleTest = () => {
    setOrigResult(simulateString(dfa, testStr).accepted);
    if (minimized) setMinResult(simulateString(minimized, testStr).accepted);
  };

  const reset = () => {
    setStage('idle');
    setMarkedUnreachable(new Set());
    setUnreachFeedback(null);
    setPartition([]);
    setPartitionStep(0);
    setStepMessages([]);
    setMinimized(null);
    setOrigResult(null);
    setMinResult(null);
  };

  const cleanStateLabel = (id: string) => dfa.states.find(s => s.id === id)?.label ?? id;
  const groupOfState = (id: string): number =>
    partition.findIndex(g => g.includes(id));

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
      {/* Header */}
      <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-4 shrink-0">
        <span className="font-bold text-violet-400 text-sm">DFA Minimization Lab</span>
        <span className="text-xs text-slate-500">Partition Refinement</span>
        <div className="ml-auto flex items-center gap-2">
          {stage === 'idle' && (
            <button onClick={handleStart} className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium text-white flex items-center gap-2">
              <Play className="w-4 h-4" /> Begin Minimization
            </button>
          )}
          {stage !== 'idle' && (
            <>
              <button onClick={handleAutoSolve} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" /> Auto-Solve
              </button>
              <button onClick={reset} className="p-1.5 text-slate-500 hover:text-slate-300"><RefreshCw className="w-4 h-4" /></button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* Left: Original DFA SVG */}
        <div className="w-72 border-r border-slate-700 flex flex-col">
          <div className="px-3 py-2 bg-slate-800/60 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Original DFA
          </div>
          <div className="flex-1 relative">
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <marker id="arr-min" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                </marker>
              </defs>

              {dfa.transitions.map(t => {
                const f = dfa.states.find(s => s.id === t.from)!;
                const to = dfa.states.find(s => s.id === t.to)!;
                if (!f || !to) return null;
                const isUnreachableEdge = !reachable.has(t.from);
                const isSelf = f.id === to.id;
                const stroke = isUnreachableEdge ? '#1e293b' : (markedUnreachable.has(t.from) ? '#7c3aed' : '#334155');

                if (isSelf) return (
                  <g key={t.id}>
                    <path d={`M ${f.x-10} ${f.y-20} C ${f.x-40} ${f.y-70}, ${f.x+40} ${f.y-70}, ${f.x+10} ${f.y-20}`}
                      fill="none" stroke={stroke} strokeWidth="1.5" markerEnd="url(#arr-min)" />
                    <text x={f.x} y={f.y - 48} textAnchor="middle" fill="#475569" fontSize="10">{t.symbols.join(',')}</text>
                  </g>
                );
                const dx = to.x - f.x; const dy = to.y - f.y;
                const len = Math.sqrt(dx*dx+dy*dy) || 1;
                const nx = dx/len; const ny = dy/len;
                return (
                  <g key={t.id}>
                    <line x1={f.x+nx*22} y1={f.y+ny*22} x2={to.x-nx*22} y2={to.y-ny*22}
                      stroke={stroke} strokeWidth="1.5" markerEnd="url(#arr-min)" />
                    <text x={(f.x+to.x)/2} y={(f.y+to.y)/2-8} textAnchor="middle" fill="#475569" fontSize="10">{t.symbols.join(',')}</text>
                  </g>
                );
              })}

              {dfa.states.map(s => {
                const isUnreach = !reachable.has(s.id);
                const isMarked  = markedUnreachable.has(s.id);
                const gi = partition.length > 0 ? groupOfState(s.id) : -1;
                let stroke = '#334155';
                if (s.initial) stroke = '#3b82f6';
                if (gi >= 0) stroke = ['#22d3ee','#a78bfa','#f59e0b','#34d399','#f87171'][gi % 5];

                return (
                  <g key={s.id} transform={`translate(${s.x},${s.y})`}
                    onClick={() => stage === 'unreachable' && toggleUnreachable(s.id)}
                    className={stage === 'unreachable' ? 'cursor-pointer' : ''}
                  >
                    {s.initial && <path d="M -45 0 L -22 0" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arr-min)" />}
                    <circle r="22" fill={isMarked ? '#4c1d95' : isUnreach ? '#0f172a' : '#1e293b'}
                      stroke={stroke} strokeWidth={isMarked ? 3 : 2}
                      strokeDasharray={isUnreach && !isMarked ? '4,3' : undefined}
                    />
                    {s.accepting && <circle r="18" fill="none" stroke={stroke} strokeWidth="1" opacity="0.6" />}
                    <text textAnchor="middle" dy="5" fill={isUnreach ? '#475569' : '#e2e8f0'} fontSize="12" fontWeight="600">{s.label}</text>
                    {isMarked && <text textAnchor="middle" dy="-28" fill="#a78bfa" fontSize="9">unreachable</text>}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* State legend */}
          <div className="border-t border-slate-700 p-3 text-xs text-slate-500 space-y-1">
            <div>→ initial &nbsp; * accepting &nbsp; dashed = unreachable</div>
            {stage === 'unreachable' && <div className="text-violet-400">Click states you think are unreachable</div>}
          </div>
        </div>

        {/* Center: Steps Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-slate-800/60 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {stage === 'idle'        && 'Workspace'}
            {stage === 'unreachable' && 'Stage 1: Remove Unreachable States'}
            {(stage === 'partition' || stage === 'refine') && `Stage 2–3: Partition Refinement (Step ${partitionStep + 1})`}
            {stage === 'done'        && 'Algorithm Complete'}
          </div>

          {stage === 'idle' && (
            <div className="flex-1 flex items-center justify-center text-slate-600 text-sm text-center px-8">
              <div>
                <p className="text-2xl mb-2">🔬</p>
                <p>Press "Begin Minimization" to start the interactive minimization walkthrough.</p>
                <p className="mt-2 text-xs">The DFA shown has redundant and unreachable states — your job is to find the smallest equivalent DFA.</p>
              </div>
            </div>
          )}

          {stage === 'unreachable' && (
            <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-sm text-slate-300 mb-2 font-semibold">Which states are unreachable from the start state?</p>
                <p className="text-xs text-slate-500">Click each unreachable state on the graph to the left, then press Check.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {dfa.states.map(s => (
                  <button key={s.id}
                    onClick={() => toggleUnreachable(s.id)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-mono transition-all ${markedUnreachable.has(s.id) ? 'bg-violet-900/50 border-violet-500 text-violet-300' : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <button onClick={checkUnreachable} className="self-start px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm text-white flex items-center gap-2">
                <ChevronRight className="w-4 h-4" /> Check
              </button>

              {unreachFeedback && (
                <div className={`p-3 rounded-lg border text-sm ${unreachFeedback.startsWith('✓') ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-300' : 'bg-rose-900/30 border-rose-500/50 text-rose-300'}`}>
                  {unreachFeedback}
                </div>
              )}
            </div>
          )}

          {(stage === 'partition' || stage === 'refine' || stage === 'done') && (
            <div className="flex-1 flex flex-col overflow-y-auto p-4 gap-4">
              {/* Current Partition Groups */}
              <div>
                <p className="text-xs text-slate-500 mb-2">
                  Current partition P<sub>{partitionStep}</sub>: {partition.length} group{partition.length !== 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-3">
                  {partition.map((group, gi) => (
                    <div key={gi} className={`border rounded-xl px-4 py-3 min-w-32 ${GROUP_COLORS[gi % GROUP_COLORS.length]}`}>
                      <div className="text-xs text-slate-400 mb-2">Group {gi + 1}</div>
                      <div className="flex flex-wrap gap-1">
                        {group.map(id => (
                          <span key={id} className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${BADGE_COLORS[gi % BADGE_COLORS.length]}`}>
                            {cleanStateLabel(id)}
                            {dfa.states.find(s => s.id === id)?.accepting ? '*' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step messages */}
              {stepMessages.length > 0 && (
                <div className="space-y-2">
                  {stepMessages.map((m, i) => (
                    <div key={i} className={`flex items-start gap-2 text-xs p-2 rounded-lg ${m.ok ? 'bg-emerald-900/20 text-emerald-300' : 'bg-amber-900/20 text-amber-300'}`}>
                      {m.ok ? <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" /> : <XCircle className="w-3 h-3 mt-0.5 shrink-0" />}
                      <span>{m.msg}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              {stage !== 'done' && (
                <div className="flex gap-3">
                  <button onClick={handleRefineStep}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm text-white flex items-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4" /> Refine Partition
                  </button>
                </div>
              )}

              {stage === 'done' && (
                <div className="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Partition stable — {partition.length} equivalence classes → minimized DFA has {partition.length} states.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Minimized DFA + comparison */}
        <div className="w-72 border-l border-slate-700 flex flex-col">
          <div className="px-3 py-2 bg-slate-800/60 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Minimized DFA
          </div>

          {minimized ? (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Original states:</span>
                    <span>{dfa.states.filter(s => reachable.has(s.id)).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Minimized states:</span>
                    <span className="text-emerald-400 font-bold">{minimized.states.length}</span>
                  </div>
                </div>

                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="py-1 px-1 text-left text-slate-500">State (merged)</th>
                      {dfa.alphabet.map(sym => <th key={sym} className="py-1 px-1 text-slate-500">{sym}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {minimized.states.map(ms => (
                      <tr key={ms.id} className="border-b border-slate-800">
                        <td className={`py-1 px-1 font-mono truncate max-w-24 ${ms.accepting ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {ms.initial ? '→' : ''}{ms.accepting ? '*' : ''}{ms.label}
                        </td>
                        {dfa.alphabet.map(sym => {
                          const dest = minimized.transitions.find(t => t.from === ms.id && t.symbols.includes(sym))?.to;
                          const dl = minimized.states.find(s => s.id === dest)?.label ?? '–';
                          return <td key={sym} className="py-1 px-1 text-slate-500 font-mono text-center">{dl}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Language equivalence check */}
              <div className="border-t border-slate-700 p-3">
                <p className="text-xs text-slate-500 mb-2">Language equivalence check:</p>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={testStr} onChange={e => setTestStr(e.target.value)}
                    className="flex-1 text-xs bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-300 font-mono focus:outline-none focus:border-violet-500"
                    placeholder="Test string"
                  />
                  <button onClick={handleTest} className="px-2 py-1 bg-violet-700 hover:bg-violet-600 rounded text-xs text-white">Run</button>
                </div>
                {origResult !== null && (
                  <div className="space-y-1">
                    <div className={`text-xs flex items-center gap-1 ${origResult ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {origResult ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      Original: {origResult ? 'Accepted' : 'Rejected'}
                    </div>
                    {minResult !== null && (
                      <>
                        <div className={`text-xs flex items-center gap-1 ${minResult ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {minResult ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          Minimized: {minResult ? 'Accepted' : 'Rejected'}
                        </div>
                        <div className={`text-xs font-semibold mt-1 ${origResult === minResult ? 'text-emerald-400' : 'text-rose-500'}`}>
                          {origResult === minResult ? '✓ Languages match' : '✗ Mismatch — bug in minimization!'}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-600 text-xs text-center px-4">
              Complete the refinement steps to generate the minimized DFA here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
