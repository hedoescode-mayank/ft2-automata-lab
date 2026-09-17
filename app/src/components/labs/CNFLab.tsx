import { useState } from 'react';
import type { Grammar } from '../../core/grammar';
import { removeEpsilonProductions, removeUnitProductions, removeUselessSymbols, convertToCNF } from '../../core/grammar/simplification';
import { ArrowRight, Type, CheckCircle2, RotateCcw } from 'lucide-react';

const INITIAL_GRAMMAR: Grammar = {
  variables: ['S', 'A', 'B', 'C'],
  terminals: ['a', 'b'],
  startSymbol: 'S',
  productions: [
    { id: 'p1', lhs: 'S', rhs: ['A', 'B', 'a'] },
    { id: 'p2', lhs: 'A', rhs: ['a', 'A'] },
    { id: 'p3', lhs: 'A', rhs: ['ε'] },
    { id: 'p4', lhs: 'B', rhs: ['b', 'B'] },
    { id: 'p5', lhs: 'B', rhs: ['C'] },
    { id: 'p6', lhs: 'C', rhs: ['c'] }, // wait, c is not in terminals? let's change to a terminal
    { id: 'p7', lhs: 'C', rhs: ['ε'] },
  ]
};

// Fix the initial grammar to have correct terminals
INITIAL_GRAMMAR.terminals = ['a', 'b', 'c'];
INITIAL_GRAMMAR.productions[5] = { id: 'p6', lhs: 'C', rhs: ['c'] };

type Step = 'INITIAL' | 'NO_EPSILON' | 'NO_UNIT' | 'NO_USELESS' | 'CNF';

export const CNFLab = () => {
  const [currentStep, setCurrentStep] = useState<Step>('INITIAL');
  
  const [grammars, setGrammars] = useState<Record<Step, Grammar>>({
    INITIAL: INITIAL_GRAMMAR,
    NO_EPSILON: INITIAL_GRAMMAR,
    NO_UNIT: INITIAL_GRAMMAR,
    NO_USELESS: INITIAL_GRAMMAR,
    CNF: INITIAL_GRAMMAR
  });

  const runStep = (step: Step) => {
    let newGrammar: Grammar;
    if (step === 'NO_EPSILON') {
      newGrammar = removeEpsilonProductions(grammars.INITIAL);
    } else if (step === 'NO_UNIT') {
      newGrammar = removeUnitProductions(grammars.NO_EPSILON);
    } else if (step === 'NO_USELESS') {
      newGrammar = removeUselessSymbols(grammars.NO_UNIT);
    } else if (step === 'CNF') {
      newGrammar = convertToCNF(grammars.NO_USELESS);
    } else {
      return;
    }
    
    setGrammars(prev => ({ ...prev, [step]: newGrammar }));
    setCurrentStep(step);
  };

  const reset = () => {
    setCurrentStep('INITIAL');
  };

  const renderGrammar = (g: Grammar, title: string, isActive: boolean) => (
    <div className={`p-4 rounded-xl border transition-all ${isActive ? 'bg-slate-800/80 border-fuchsia-500 shadow-[0_0_15px_rgba(192,38,211,0.2)]' : 'bg-slate-900/50 border-slate-700/50'}`}>
      <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isActive ? 'text-fuchsia-400' : 'text-slate-400'}`}>{title}</h3>
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {g.productions.length === 0 ? (
          <div className="text-slate-500 italic text-sm">Empty grammar</div>
        ) : (
          g.productions.map((p, i) => (
            <div key={`${p.lhs}-${i}`} className="font-mono text-sm text-slate-300 flex items-center gap-2">
              <span className="text-fuchsia-300 font-bold w-6 text-right">{p.lhs}</span>
              <span className="text-slate-500">→</span>
              <span className="text-emerald-300">{p.rhs.join('') || 'ε'}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden border-l border-slate-700">
      <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-4 shrink-0">
        <span className="font-bold text-fuchsia-400 text-sm">CFG Simplification & CNF</span>
        <span className="text-xs text-slate-500">Chomsky Normal Form Algorithm</span>
        <div className="ml-auto flex gap-2">
          <button onClick={reset} className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center">
        
        <div className="w-full max-w-5xl mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
              <Type className="w-6 h-6 text-fuchsia-400" /> Algorithm Pipeline
            </h2>
          </div>

          {/* Stepper UI */}
          <div className="flex items-center justify-between mb-8 bg-slate-800/50 p-2 rounded-xl border border-slate-700">
            {[
              { id: 'INITIAL', label: 'Start Grammar' },
              { id: 'NO_EPSILON', label: '1. Remove ε' },
              { id: 'NO_UNIT', label: '2. Remove Unit' },
              { id: 'NO_USELESS', label: '3. Remove Useless' },
              { id: 'CNF', label: '4. Convert to CNF' }
            ].map((step, idx, arr) => (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => idx > 0 ? runStep(step.id as Step) : reset()}
                  className={`flex flex-col items-center gap-2 px-4 py-2 rounded-lg transition-colors
                    ${currentStep === step.id ? 'text-fuchsia-400' : 'text-slate-400 hover:text-slate-200'}
                  `}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                    ${currentStep === step.id ? 'border-fuchsia-500 bg-fuchsia-900/40 shadow-[0_0_10px_rgba(192,38,211,0.5)]' : 'border-slate-600 bg-slate-800'}
                  `}>
                    {idx === 0 ? <Type className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider">{step.label}</span>
                </button>
                {idx < arr.length - 1 && (
                  <div className="flex-1 h-px bg-slate-700 mx-2 relative">
                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 translate-x-1/2" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Grammar Displays */}
          <div className="grid grid-cols-2 gap-6">
            {/* Always show initial or previous step for comparison */}
            {currentStep !== 'INITIAL' && (
              renderGrammar(
                grammars[
                  currentStep === 'NO_EPSILON' ? 'INITIAL' :
                  currentStep === 'NO_UNIT' ? 'NO_EPSILON' :
                  currentStep === 'NO_USELESS' ? 'NO_UNIT' : 'NO_USELESS'
                ],
                'Previous State',
                false
              )
            )}
            
            {renderGrammar(grammars[currentStep], currentStep === 'INITIAL' ? 'Initial Grammar' : 'Current State', true)}
          </div>

        </div>

      </div>
    </div>
  );
};
