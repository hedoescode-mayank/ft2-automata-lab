import { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { useAgentStore } from '../../store/useAgentStore';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
import { AutomataCanvas } from '../scene/AutomataCanvas';
import { TransitionTable } from './TransitionTable';
import { StringSimulator } from './StringSimulator';
import { LessonPanel } from './LessonPanel';
import { NfaToDfaLab } from '../labs/NfaToDfaLab';
import { MinimizationLab } from '../labs/MinimizationLab';
import { RegexLab } from '../labs/RegexLab';
import { EquivalenceLab } from '../labs/EquivalenceLab';
import { TwoWayDFALab } from '../labs/TwoWayDFALab';
import { MooreMealyLab } from '../labs/MooreMealyLab';
import { GrammarWorkspace } from './GrammarWorkspace';
import { CNFLab } from '../labs/CNFLab';
import { getLessonById } from '../../core/lessons/lessonData';

export const Workspace = () => {
  const { setViewMode, addState, currentZone, setAutomaton } = useStore();
  const { setContext } = useAgentStore();

  const lesson = currentZone ? getLessonById(currentZone) : null;

  useEffect(() => {
    if (lesson) {
      setContext(`Lab: ${lesson.title} - ${lesson.subtitle}`);
    }
  }, [lesson, setContext]);

  // Some zones have dedicated lab UIs instead of the generic editor
  const isNfaDfaLab     = lesson?.workspace === 'nfa-to-dfa-lab';
  const isMinimizeLab   = lesson?.workspace === 'minimization-lab';
  const isRegexLab      = lesson?.workspace === 'regex-lab';
  const isEquivLab      = lesson?.workspace === 'equivalence-arena';
  const isTwoWayDFALab  = lesson?.workspace === 'tape-2dfa';
  const isMooreMealyLab = lesson?.workspace === 'moore-mealy';
  const isGrammarLab    = lesson?.workspace === 'grammar';
  const isCNFLab        = lesson?.workspace === 'cnf';

  const handleAddState = () => {
    const x = Math.random() * 300 + 150;
    const y = Math.random() * 200 + 120;
    addState(x, y);
  };

  const handleLoadAutomaton = (json: string) => {
    try {
      const automaton = JSON.parse(json);
      setAutomaton(automaton);
    } catch {
      console.error('Failed to parse automaton JSON');
    }
  };

  // ── Special labs ──────────────────────────────────────────
  if (isNfaDfaLab) {
    return (
      <div className="flex-1 flex h-full overflow-hidden">
        {lesson && <LessonPanel lesson={lesson} onLoadAutomaton={handleLoadAutomaton} />}
        <NfaToDfaLab />
      </div>
    );
  }

  if (isMinimizeLab) {
    return (
      <div className="flex-1 flex h-full overflow-hidden">
        {lesson && <LessonPanel lesson={lesson} onLoadAutomaton={handleLoadAutomaton} />}
        <MinimizationLab />
      </div>
    );
  }

  if (isRegexLab) {
    return (
      <div className="flex-1 flex h-full overflow-hidden">
        {lesson && <LessonPanel lesson={lesson} onLoadAutomaton={handleLoadAutomaton} />}
        <RegexLab />
      </div>
    );
  }

  if (isEquivLab) {
    return (
      <div className="flex-1 flex h-full overflow-hidden">
        {lesson && <LessonPanel lesson={lesson} onLoadAutomaton={handleLoadAutomaton} />}
        <EquivalenceLab />
      </div>
    );
  }

  if (isTwoWayDFALab) {
    return (
      <div className="flex-1 flex h-full overflow-hidden">
        {lesson && <LessonPanel lesson={lesson} onLoadAutomaton={handleLoadAutomaton} />}
        <TwoWayDFALab />
      </div>
    );
  }

  if (isMooreMealyLab) {
    return (
      <div className="flex-1 flex h-full overflow-hidden">
        {lesson && <LessonPanel lesson={lesson} onLoadAutomaton={handleLoadAutomaton} />}
        <MooreMealyLab />
      </div>
    );
  }

  if (isGrammarLab) {
    return (
      <div className="flex-1 flex h-full overflow-hidden">
        {lesson && <LessonPanel lesson={lesson} onLoadAutomaton={handleLoadAutomaton} />}
        <GrammarWorkspace />
      </div>
    );
  }

  if (isCNFLab) {
    return (
      <div className="flex-1 flex h-full overflow-hidden">
        {lesson && <LessonPanel lesson={lesson} onLoadAutomaton={handleLoadAutomaton} />}
        <CNFLab />
      </div>
    );
  }

  // ── Generic automata workspace ────────────────────────────
  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {lesson && (
        <LessonPanel lesson={lesson} onLoadAutomaton={handleLoadAutomaton} />
      )}

      <div className="flex-1 flex flex-col relative bg-slate-900 h-full overflow-hidden">
        {/* Toolbar */}
        <div className="h-12 border-b border-slate-700 bg-slate-800 flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setViewMode('map')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Map
          </button>
          <div className="w-px h-6 bg-slate-700" />
          <button
            onClick={handleAddState}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium flex items-center gap-1.5 text-white transition-colors"
          >
            <Plus className="w-4 h-4" /> State
          </button>
          <span className="text-xs text-slate-600">
            Shift+drag between states → transition. Double-click state → rename / toggle.
          </span>
          <div className="ml-auto">
            <button className="p-1.5 text-slate-600 hover:text-slate-400 rounded">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas + Table */}
        <div className="flex-1 relative flex overflow-hidden">
          <div className="flex-1 relative">
            <AutomataCanvas />
          </div>
          <TransitionTable />
        </div>

        {/* Simulator */}
        <StringSimulator />
      </div>
    </div>
  );
};
