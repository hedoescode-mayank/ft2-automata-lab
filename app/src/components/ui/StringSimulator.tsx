import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { move, epsilonClosure } from '../../core/automata/simulation';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';

export const StringSimulator = () => {
  const { automaton } = useStore();
  const [input, setInput] = useState('0101');
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStates, setActiveStates] = useState<string[]>([]);
  const [history, setHistory] = useState<{ symbol: string, states: string[] }[]>([]);

  const handleReset = () => {
    setStep(0);
    setIsPlaying(false);
    const initials = automaton.states.filter(s => s.initial).map(s => s.id);
    const startSet = automaton.type === 'ENFA' ? epsilonClosure(initials, automaton) : initials;
    setActiveStates(startSet);
    setHistory([{ symbol: '', states: startSet }]);
  };

  const handleStep = () => {
    if (step >= input.length) {
      setIsPlaying(false);
      return;
    }

    const symbol = input[step];
    let next = move(activeStates, symbol, automaton);
    if (automaton.type === 'ENFA') {
      next = epsilonClosure(next, automaton);
    }
    
    setActiveStates(next);
    setHistory(prev => [...prev, { symbol, states: next }]);
    setStep(prev => prev + 1);
  };

  const getLabels = (ids: string[]) => ids.map(id => automaton.states.find(s => s.id === id)?.label).join(', ');

  const isFinished = step >= input.length && step > 0;
  const isAccepted = isFinished && activeStates.some(id => automaton.states.find(s => s.id === id)?.accepting);

  return (
    <div className="h-56 border-t border-slate-700 bg-slate-800 p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">String Simulator</h3>
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => { setInput(e.target.value); handleReset(); }}
            placeholder="Input string"
            className="w-48 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button onClick={handleReset} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded" title="Reset">
            <RotateCcw className="w-4 h-4 text-slate-200" />
          </button>
          <button onClick={handleStep} disabled={isFinished} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50" title="Step">
            <StepForward className="w-4 h-4 text-slate-200" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} disabled={isFinished} className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded disabled:opacity-50" title={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 font-mono overflow-y-auto">
        <div className="flex-1">
          <div className="text-xl tracking-[0.5em] text-slate-500 mb-2">
            {input.split('').map((char, i) => (
              <span key={i} className={i === step ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-1' : (i < step ? 'text-slate-300' : '')}>
                {char}
              </span>
            ))}
          </div>
          <div className="text-sm text-slate-400">
            Active States: <span className="text-cyan-300 font-bold">{"{" + getLabels(activeStates) + "}"}</span>
          </div>
        </div>

        <div className="w-64 border-l border-slate-700 pl-6 text-sm">
          <h4 className="text-slate-400 mb-2">History</h4>
          <div className="space-y-1">
            {history.map((h, i) => (
              <div key={i} className="text-slate-300">
                {i === 0 ? 'Start' : `Read '${h.symbol}'`} ➔ {"{" + getLabels(h.states) + "}"}
              </div>
            ))}
          </div>
          {isFinished && (
            <div className={`mt-4 p-2 text-center rounded font-bold ${isAccepted ? 'bg-emerald-900/50 text-emerald-400' : 'bg-rose-900/50 text-rose-400'}`}>
              {isAccepted ? 'ACCEPTED' : 'REJECTED'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
