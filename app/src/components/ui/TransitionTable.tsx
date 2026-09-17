import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';

const TableCell = ({ initialValue, onSave }: { initialValue: string, onSave: (val: string) => void }) => {
  const [val, setVal] = useState(initialValue);

  useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    if (val !== initialValue) onSave(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.currentTarget as HTMLElement).blur();
    }
  };

  return (
    <input 
      type="text" 
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-xs"
    />
  );
};

export const TransitionTable = () => {
  const { automaton, updateFromTable } = useStore();

  const handleCellChange = (stateId: string, symbol: string, value: string) => {
    const targets = value.split(',').map(s => s.trim()).filter(Boolean);
    updateFromTable(stateId, symbol, targets);
  };

  const extendedAlphabet = automaton.type === 'ENFA' ? [...automaton.alphabet, 'ε'] : automaton.alphabet;

  return (
    <div className="w-80 border-l border-slate-700 bg-slate-800 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Transition Table</h3>
      <table className="w-full text-sm text-left border-collapse">
        <thead className="text-slate-400 border-b border-slate-700">
          <tr>
            <th className="py-2 px-2">State</th>
            {extendedAlphabet.map(sym => <th key={sym} className="py-2 px-2">{sym}</th>)}
          </tr>
        </thead>
        <tbody>
          {automaton.states.map(s => {
            const prefix = (s.initial ? '→' : '') + (s.accepting ? '*' : '');
            return (
              <tr key={s.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="py-2 px-2 text-slate-300 font-mono whitespace-nowrap">
                  {prefix}{s.label}
                </td>
                {extendedAlphabet.map(sym => {
                  const targetIds = automaton.transitions
                    .filter(t => t.from === s.id && t.symbols.includes(sym))
                    .map(t => t.to);
                  const targetLabels = targetIds
                    .map(id => automaton.states.find(st => st.id === id)?.label)
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <td key={sym} className="py-1 px-1">
                      <TableCell 
                        initialValue={targetLabels} 
                        onSave={(newVal) => handleCellChange(s.id, sym, newVal)}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 text-xs text-slate-500">
        Edit table cells to update graph. Comma-separate states for NFA.
      </div>
    </div>
  );
};
