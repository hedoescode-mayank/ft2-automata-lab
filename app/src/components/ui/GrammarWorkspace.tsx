import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { addProduction, type Grammar } from '../../core/grammar';
import { ArrowLeft, Plus, Type, RotateCcw } from 'lucide-react';

type TreeNode = {
  id: string;
  symbol: string;
  children?: TreeNode[];
};

export const GrammarWorkspace = () => {
  const { setViewMode } = useStore();
  
  // Preset grammar for ambiguity (e.g. S -> S + S | S * S | a)
  const presetGrammar: Grammar = {
    variables: ['S'],
    terminals: ['a', '+', '*'],
    startSymbol: 'S',
    productions: [
      { id: 'p1', lhs: 'S', rhs: ['S', '+', 'S'] },
      { id: 'p2', lhs: 'S', rhs: ['S', '*', 'S'] },
      { id: 'p3', lhs: 'S', rhs: ['a'] },
    ]
  };

  const [grammar, setGrammar] = useState<Grammar>(presetGrammar);
  const [newLhs, setNewLhs] = useState('S');
  const [newRhs, setNewRhs] = useState('');

  // Tree state
  const [tree, setTree] = useState<TreeNode>({ id: 'root', symbol: 'S' });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleAddProduction = () => {
    if (!newRhs) return;
    const rhsTokens = newRhs.split('').filter(s => s.trim() !== '');
    setGrammar(addProduction(grammar, newLhs, rhsTokens));
    setNewRhs('');
  };

  const expandNode = (node: TreeNode, targetId: string, rhs: string[]): TreeNode => {
    if (node.id === targetId) {
      if (rhs.length === 0 || (rhs.length === 1 && rhs[0] === 'ε')) {
        return { ...node, children: [{ id: `${node.id}-eps`, symbol: 'ε' }] };
      }
      return {
        ...node,
        children: rhs.map((sym, i) => ({ id: `${node.id}-${i}`, symbol: sym }))
      };
    }
    if (node.children) {
      return {
        ...node,
        children: node.children.map(c => expandNode(c, targetId, rhs))
      };
    }
    return node;
  };

  const handleApplyProduction = (rhs: string[]) => {
    if (!selectedNodeId) return;
    setTree(prev => expandNode(prev, selectedNodeId, rhs));
    setSelectedNodeId(null);
  };

  const resetDerivation = () => {
    setTree({ id: 'root', symbol: grammar.startSymbol });
    setSelectedNodeId(null);
  };

  const getYield = (node: TreeNode): string => {
    if (!node.children) return node.symbol === 'ε' ? '' : node.symbol;
    return node.children.map(getYield).join('');
  };

  const currentYield = getYield(tree);

  // Render tree recursively
  const renderTree = (node: TreeNode, depth = 0) => {
    const isLeaf = !node.children;
    const isVariable = grammar.variables.includes(node.symbol);
    const isSelected = selectedNodeId === node.id;
    const isEpsilon = node.symbol === 'ε';

    return (
      <div key={node.id} className="flex flex-col items-center">
        <button
          onClick={() => isLeaf && isVariable && setSelectedNodeId(isSelected ? null : node.id)}
          disabled={!isLeaf || !isVariable}
          className={`px-3 py-1.5 rounded-lg border text-sm font-bold font-mono transition-colors whitespace-nowrap z-10 relative
            ${isEpsilon ? 'bg-slate-800 text-slate-500 border-slate-700' :
              isVariable 
                ? isLeaf 
                  ? isSelected ? 'bg-fuchsia-600 text-white border-fuchsia-500 shadow-[0_0_15px_rgba(192,38,211,0.5)] scale-110' : 'bg-fuchsia-900/40 text-fuchsia-300 border-fuchsia-500/50 hover:bg-fuchsia-800/60 cursor-pointer'
                  : 'bg-slate-800 text-fuchsia-400 border-slate-600'
                : 'bg-emerald-900/40 text-emerald-300 border-emerald-500/50'
            }`}
        >
          {node.symbol}
        </button>

        {node.children && (
          <div className="flex gap-4 mt-8 relative">
            {/* Draw connecting lines via SVG or absolute divs */}
            <div className="absolute top-[-2rem] left-[50%] right-[50%] h-[2rem] w-px bg-slate-600" />
            <div className="absolute top-[-1rem] left-[10%] right-[10%] h-px bg-slate-600" />
            
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center relative pt-4">
                <div className="absolute top-0 left-[50%] w-px h-4 bg-slate-600" />
                {renderTree(child, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Find selected node symbol
  let selectedSymbol = '';
  const findSymbol = (node: TreeNode) => {
    if (node.id === selectedNodeId) selectedSymbol = node.symbol;
    if (node.children) node.children.forEach(findSymbol);
  };
  if (selectedNodeId) findSymbol(tree);

  const availableProductions = grammar.productions.filter(p => p.lhs === selectedSymbol);

  return (
    <div className="flex-1 flex flex-col relative bg-slate-900">
      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        <button 
          onClick={() => setViewMode('map')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700 pointer-events-auto shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Map
        </button>
      </div>

      <div className="flex-1 flex pt-20 px-8 pb-8 gap-6 h-full overflow-hidden">
        
        {/* Left Panel: Grammar Rules */}
        <div className="w-80 bg-slate-800 border border-slate-700 rounded-xl flex flex-col shadow-xl">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-base font-bold flex items-center gap-2 text-fuchsia-400">
              <Type className="w-4 h-4" />
              Context-Free Grammar
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {grammar.productions.length === 0 ? (
              <p className="text-slate-500 italic text-sm">No productions yet.</p>
            ) : (
              grammar.productions.map(p => (
                <div key={p.id} className="p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg font-mono text-sm flex items-center gap-3">
                  <span className="text-fuchsia-400 font-bold w-4 text-center">{p.lhs}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-emerald-300">{p.rhs.join('') || 'ε'}</span>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-700 bg-slate-800/80 rounded-b-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Add Production</div>
            <div className="flex gap-2 items-center font-mono">
              <input 
                type="text" 
                value={newLhs}
                onChange={(e) => setNewLhs(e.target.value.toUpperCase())}
                maxLength={1}
                className="w-10 bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-center text-sm text-fuchsia-400 font-bold focus:outline-none focus:border-fuchsia-500"
              />
              <span className="text-slate-500">→</span>
              <input 
                type="text" 
                value={newRhs}
                onChange={(e) => setNewRhs(e.target.value)}
                placeholder="aSb"
                className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-fuchsia-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddProduction()}
              />
              <button onClick={handleAddProduction} className="p-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 rounded text-white shadow">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Derivation Workspace */}
        <div className="flex-1 flex flex-col bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden relative shadow-xl">
          
          {/* Header */}
          <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
            <span className="font-bold text-slate-200 text-sm">Derivation Tree</span>
            <div className="flex items-center gap-4">
              <div className="text-xs text-slate-400 font-mono bg-slate-900 px-3 py-1 rounded border border-slate-700">
                Yield: <span className="text-emerald-400 font-bold text-sm tracking-widest">{currentYield || 'ε'}</span>
              </div>
              <button 
                onClick={resetDerivation}
                className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded transition-colors"
                title="Reset Tree"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tree Canvas */}
          <div className="flex-1 overflow-auto p-12 flex justify-center items-start min-h-[400px]">
            {renderTree(tree)}
          </div>

          {/* Production Selector Popup */}
          {selectedNodeId && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 border border-fuchsia-500/50 rounded-xl p-4 shadow-2xl shadow-fuchsia-900/20 animate-in slide-in-from-bottom-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 text-center">
                Expand <span className="text-fuchsia-400">{selectedSymbol}</span>
              </h3>
              <div className="flex gap-2 justify-center flex-wrap">
                {availableProductions.length === 0 ? (
                  <span className="text-sm text-rose-400">No productions found for {selectedSymbol}</span>
                ) : (
                  availableProductions.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleApplyProduction(p.rhs)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-700 border border-slate-600 hover:border-fuchsia-500 rounded-lg text-sm font-mono text-emerald-300 transition-colors shadow"
                    >
                      {p.rhs.join('') || 'ε'}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {!selectedNodeId && currentYield.length < 15 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-slate-500 pointer-events-none animate-pulse">
              Click a non-terminal (magenta) to expand it
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
