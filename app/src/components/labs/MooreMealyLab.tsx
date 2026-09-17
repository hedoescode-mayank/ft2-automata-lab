import { useState, useEffect } from 'react';
import type { Automaton } from '../../core/automata/types';
import { simulateMoore, simulateMealy } from '../../core/automata/transducers';
import { useStore } from '../../store/useStore';
import { Play, RotateCcw, Box, ArrowRight, Settings2 } from 'lucide-react';

const MOORE_PRESET: Automaton = {
  type: 'MOORE',
  alphabet: ['a', 'b'],
  states: [
    { id: 'q0', label: 'Start (0)', x: 100, y: 150, initial: true, accepting: false, output: '0' },
    { id: 'q1', label: 'Seen a (1)', x: 300, y: 150, initial: false, accepting: false, output: '1' },
  ],
  transitions: [
    { id: 't1', from: 'q0', to: 'q1', symbols: ['a'] },
    { id: 't2', from: 'q0', to: 'q0', symbols: ['b'] },
    { id: 't3', from: 'q1', to: 'q0', symbols: ['a'] },
    { id: 't4', from: 'q1', to: 'q1', symbols: ['b'] },
  ],
  initialState: 'q0'
};

const MEALY_PRESET: Automaton = {
  type: 'MEALY',
  alphabet: ['a', 'b'],
  states: [
    { id: 'p0', label: 'Start', x: 100, y: 150, initial: true, accepting: false },
    { id: 'p1', label: 'Seen a', x: 300, y: 150, initial: false, accepting: false },
  ],
  transitions: [
    { id: 't1', from: 'p0', to: 'p1', symbols: ['a/1'] },
    { id: 't2', from: 'p0', to: 'p0', symbols: ['b/0'] },
    { id: 't3', from: 'p1', to: 'p0', symbols: ['a/1'] },
    { id: 't4', from: 'p1', to: 'p1', symbols: ['b/0'] },
  ],
  initialState: 'p0'
};

export const MooreMealyLab = () => {
  const { setAutomaton } = useStore();
  const [machineType, setMachineType] = useState<'MOORE' | 'MEALY'>('MOORE');
  const [inputString, setInputString] = useState('ababa');
  const [result, setResult] = useState<{ output: string, path: string[] } | null>(null);

  const currentPreset = machineType === 'MOORE' ? MOORE_PRESET : MEALY_PRESET;

  useEffect(() => {
    setAutomaton(currentPreset);
    setResult(null);
  }, [machineType, setAutomaton]);

  const handleSimulate = () => {
    if (machineType === 'MOORE') {
      setResult(simulateMoore(currentPreset, inputString));
    } else {
      setResult(simulateMealy(currentPreset, inputString));
    }
  };

  const reset = () => {
    setResult(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden border-l border-slate-700">
      {/* Header */}
      <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-4 shrink-0">
        <span className="font-bold text-orange-400 text-sm">Transducers Lab</span>
        <span className="text-xs text-slate-500">Moore & Mealy Machines</span>
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-y-auto items-center">
        
        {/* Controls */}
        <div className="w-full max-w-2xl bg-slate-800/80 rounded-xl border border-slate-700 p-6 mb-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-orange-400" /> Settings
            </h2>
            
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
              <button 
                onClick={() => setMachineType('MOORE')}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                  machineType === 'MOORE' ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Moore Machine
              </button>
              <button 
                onClick={() => setMachineType('MEALY')}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                  machineType === 'MEALY' ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Mealy Machine
              </button>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700/50">
            <p className="text-sm text-slate-300">
              {machineType === 'MOORE' 
                ? "Moore machines output values upon entering a state. Notice that the output length is always one character longer than the input string (due to the initial state)."
                : "Mealy machines output values upon taking a transition. The output length matches the input length exactly."
              }
            </p>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Input String</label>
              <input 
                type="text" 
                value={inputString} 
                onChange={e => setInputString(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-orange-500"
                placeholder="e.g. ababa"
              />
            </div>
            
            <button 
              onClick={handleSimulate}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 rounded-lg font-bold text-white flex items-center gap-2 shadow-lg shadow-orange-900/20"
            >
              <Play className="w-4 h-4" /> Run
            </button>
            
            <button 
              onClick={reset}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="w-full max-w-2xl bg-slate-800/80 rounded-xl border border-slate-700 p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Box className="w-4 h-4 text-orange-400" /> Simulation Result
            </h3>
            
            <div className="space-y-6">
              
              <div>
                <div className="text-xs text-slate-500 mb-1">Input Sequence</div>
                <div className="font-mono text-xl text-slate-300 tracking-[0.5em] bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
                  {inputString === '' ? 'ε' : inputString}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">Generated Output</div>
                <div className="font-mono text-2xl font-bold text-orange-400 tracking-[0.5em] bg-orange-950/30 px-4 py-3 rounded-lg border border-orange-900/50">
                  {result.output === '' ? 'ε' : result.output}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-2">State Path</div>
                <div className="flex flex-wrap items-center gap-2">
                  {result.path.map((stateId, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="px-2.5 py-1 bg-slate-700 text-slate-300 text-xs font-mono rounded border border-slate-600">
                        {currentPreset.states.find(s => s.id === stateId)?.label ?? stateId}
                      </div>
                      {i < result.path.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600" />}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};
