import { useState, useEffect } from 'react';
import type { Automaton } from '../../core/automata/types';
import { useStore } from '../../store/useStore';
import { Play, RotateCcw, ChevronRight, CheckCircle, XCircle } from 'lucide-react';

// ─── 2DFA Preset ─────────────────────────────────────────────────────────────
// Example 2DFA: Check if string has equal number of 0s and 1s by crossing them out.
// We'll use a simpler example: accepts strings that start and end with the same character.
// Even simpler for 2DFA: move right to end, read last char, move left to start, check if match.

// Let's use standard notation: symbol,direction. e.g. "0,R" "1,L"
const TWO_WAY_DFA: Automaton = {
  type: 'TWO_WAY',
  alphabet: ['0,R', '1,R', '0,L', '1,L', '⊢,R', '⊣,L'],
  states: [
    { id: 'q0', label: 'Start', x: 50, y: 150, initial: true, accepting: false },
    { id: 'q1', label: 'Scan0_R', x: 200, y: 80, initial: false, accepting: false },
    { id: 'q2', label: 'Scan1_R', x: 200, y: 220, initial: false, accepting: false },
    { id: 'q3', label: 'FoundEnd0', x: 350, y: 80, initial: false, accepting: false },
    { id: 'q4', label: 'FoundEnd1', x: 350, y: 220, initial: false, accepting: false },
    { id: 'q5', label: 'Match', x: 500, y: 150, initial: false, accepting: true },
    { id: 'q6', label: 'Reject', x: 500, y: 50, initial: false, accepting: false },
  ],
  transitions: [
    // from q0, read first char, move R
    { id: 't1', from: 'q0', to: 'q1', symbols: ['0,R'] },
    { id: 't2', from: 'q0', to: 'q2', symbols: ['1,R'] },
    // scan right to end
    { id: 't3', from: 'q1', to: 'q1', symbols: ['0,R', '1,R'] },
    { id: 't4', from: 'q2', to: 'q2', symbols: ['0,R', '1,R'] },
    // hit right end marker ⊣, move L and check last char
    { id: 't5', from: 'q1', to: 'q3', symbols: ['⊣,L'] },
    { id: 't6', from: 'q2', to: 'q4', symbols: ['⊣,L'] },
    // check if last char matches the remembered first char
    { id: 't7', from: 'q3', to: 'q5', symbols: ['0,L', '0,R'] }, // found 0, matches! accept
    { id: 't8', from: 'q3', to: 'q6', symbols: ['1,L', '1,R'] }, // found 1, mismatch
    { id: 't9', from: 'q4', to: 'q6', symbols: ['0,L', '0,R'] }, // found 0, mismatch
    { id: 't10', from: 'q4', to: 'q5', symbols: ['1,L', '1,R'] }, // found 1, matches!
  ],
  initialState: 'q0'
};

export const TwoWayDFALab = () => {
  const { setAutomaton } = useStore();
  const [dfa] = useState<Automaton>(TWO_WAY_DFA);
  const [inputString, setInputString] = useState('0110');
  
  // Tape has left endmarker ⊢ and right endmarker ⊣
  const tape = ['⊢', ...inputString.split(''), '⊣'];
  
  const [headPos, setHeadPos] = useState(1); // start after left endmarker
  const [currentState, setCurrentState] = useState(dfa.initialState!);
  const [history, setHistory] = useState<Array<{ state: string, pos: number }>>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'accept' | 'reject' | 'crash' | 'loop'>('idle');

  // Ensure canvas loads the DFA
  useEffect(() => {
    setAutomaton(dfa);
  }, [dfa, setAutomaton]);

  const reset = () => {
    setHeadPos(1);
    setCurrentState(dfa.initialState!);
    setHistory([]);
    setStatus('idle');
  };

  useEffect(() => {
    reset();
  }, [inputString]);

  const step = () => {
    if (status !== 'idle' && status !== 'running') return;
    
    // Check if we accept first (some 2DFAs accept immediately)
    if (dfa.states.find(s => s.id === currentState)?.accepting) {
      setStatus('accept');
      return;
    }

    const symbolUnderHead = tape[headPos] ?? '␣';
    
    // Find matching transition. 2DFA transitions usually format as "char,Dir"
    // e.g. "0,R"
    const transitions = dfa.transitions.filter(t => t.from === currentState);
    let matchedTransition = null;
    let direction = 0; // 1 for R, -1 for L, 0 for N (stay)

    for (const t of transitions) {
      for (const symStr of t.symbols) {
        const [char, dir] = symStr.split(',');
        if (char === symbolUnderHead) {
          matchedTransition = t;
          if (dir === 'R') direction = 1;
          else if (dir === 'L') direction = -1;
          break;
        }
      }
      if (matchedTransition) break;
    }

    if (!matchedTransition) {
      // No transition -> reject/crash
      setStatus('reject');
      return;
    }

    const nextState = matchedTransition.to;
    const nextPos = headPos + direction;

    // Check for infinite loop (simplistic check)
    const loopKey = `${nextState}:${nextPos}`;
    if (history.slice(-100).some(h => `${h.state}:${h.pos}` === loopKey) && history.length > 50) {
      // Very naive loop detection just for the UI
      setStatus('loop');
      return;
    }

    setHistory(prev => [...prev, { state: currentState, pos: headPos }]);
    setCurrentState(nextState);
    setHeadPos(nextPos);

    if (dfa.states.find(s => s.id === nextState)?.accepting) {
      setStatus('accept');
    }
  };

  const autoRun = () => {
    reset();
    setStatus('running');
  };

  useEffect(() => {
    if (status === 'running') {
      const timer = setTimeout(() => {
        step();
      }, 500); // 500ms delay per step for visualization
      return () => clearTimeout(timer);
    }
  }, [status, headPos, currentState]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 border-l border-slate-700">
      {/* Header */}
      <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-4 shrink-0">
        <span className="font-bold text-sky-400 text-sm">2DFA Tape Simulator</span>
        <span className="text-xs text-slate-500">Two-Way Finite Automaton</span>
        
        <div className="ml-auto flex gap-2">
          <input 
            type="text" 
            value={inputString} 
            onChange={e => setInputString(e.target.value)}
            className="w-32 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            placeholder="Input string"
          />
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center overflow-y-auto">
        <div className="text-center mb-8 max-w-lg">
          <h2 className="text-xl font-bold text-slate-200 mb-2">Bidirectional Tape</h2>
          <p className="text-sm text-slate-400">
            A Two-Way DFA can move its read head left (L) or right (R). It can read the input string multiple times. The tape is bounded by <strong>⊢</strong> (left endmarker) and <strong>⊣</strong> (right endmarker).
          </p>
        </div>

        {/* Tape Visualization */}
        <div className="relative mb-12">
          {/* Head Indicator */}
          <div 
            className="absolute -top-10 transition-all duration-300 ease-in-out flex flex-col items-center"
            style={{ left: `${headPos * 3.5 + 1.75}rem`, transform: 'translateX(-50%)' }}
          >
            <div className="bg-sky-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
              {dfa.states.find(s => s.id === currentState)?.label}
            </div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-sky-600 mt-1" />
          </div>

          {/* Tape Cells */}
          <div className="flex bg-slate-800 rounded-lg p-2 border border-slate-700 shadow-2xl">
            {tape.map((char, i) => (
              <div 
                key={i} 
                className={`w-14 h-16 flex items-center justify-center text-2xl font-mono rounded-md mx-0.5 border-2 transition-colors ${
                  i === headPos 
                    ? 'border-sky-500 bg-sky-900/30 text-sky-300' 
                    : 'border-slate-700 bg-slate-900 text-slate-400'
                }`}
              >
                {char}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={reset}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 border border-slate-700"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={step}
            disabled={status === 'accept' || status === 'reject' || status === 'loop'}
            className="px-6 py-2 bg-sky-700 hover:bg-sky-600 disabled:opacity-50 rounded-lg font-bold flex items-center gap-2"
          >
            <ChevronRight className="w-5 h-5" /> Step Forward
          </button>
          
          <button 
            onClick={autoRun}
            disabled={status === 'running' || status === 'accept' || status === 'reject'}
            className="p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-full text-slate-400 border border-slate-700"
            title="Auto Run"
          >
            <Play className="w-5 h-5" />
          </button>
        </div>

        {/* Status */}
        {status !== 'idle' && status !== 'running' && (
          <div className={`mt-4 p-4 rounded-xl border flex items-center gap-3 text-lg font-bold shadow-lg ${
            status === 'accept' ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-400' : 
            status === 'reject' ? 'bg-rose-900/40 border-rose-500/50 text-rose-400' :
            'bg-amber-900/40 border-amber-500/50 text-amber-400'
          }`}>
            {status === 'accept' && <><CheckCircle className="w-6 h-6" /> Accepted!</>}
            {status === 'reject' && <><XCircle className="w-6 h-6" /> Rejected!</>}
            {status === 'loop' && <><RotateCcw className="w-6 h-6" /> Infinite Loop Detected!</>}
          </div>
        )}

      </div>
    </div>
  );
};
