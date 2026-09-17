import { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { useAgentStore } from '../../store/useAgentStore';
import { LESSONS } from '../../core/lessons/lessonData';
import type { LessonId } from '../../core/lessons/types';
import { BookOpen, ChevronRight, Lock } from 'lucide-react';

const UNIT_COLORS = ['from-blue-500 to-cyan-500', 'from-violet-500 to-fuchsia-500'];

export const Dashboard = () => {
  const { setViewMode, setCurrentZone } = useStore();
  const { setContext } = useAgentStore();

  useEffect(() => {
    setContext('Level Selection Dashboard. Showcasing all the automata learning units from Unit 1 to Unit 4.');
  }, [setContext]);

  const unit1 = LESSONS.filter(l => l.unit === 1);
  const unit2 = LESSONS.filter(l => l.unit === 2);

  const handleEnter = (lessonId: LessonId) => {
    setCurrentZone(lessonId);
    setViewMode('workspace');
  };

  const renderLesson = (lesson: typeof LESSONS[0], idx: number) => {
    const isUnlocked = true; // In future: check mastery store
    return (
      <button
        key={lesson.id}
        onClick={() => isUnlocked && handleEnter(lesson.id as LessonId)}
        className={`w-full text-left p-3 rounded-lg border transition-all group relative
          ${isUnlocked
            ? 'border-slate-700 bg-slate-800 hover:border-cyan-500/50 hover:bg-slate-700'
            : 'border-slate-800 bg-slate-800/40 opacity-50 cursor-not-allowed'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
              {idx + 1}
            </span>
            <div>
              <div className="text-sm font-semibold text-slate-200 group-hover:text-white">{lesson.title}</div>
              <div className="text-xs text-slate-500">{lesson.subtitle}</div>
            </div>
          </div>
          {isUnlocked
            ? <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
            : <Lock className="w-3 h-3 text-slate-600 shrink-0" />
          }
        </div>

        {/* exam weight indicator */}
        <div className="mt-2 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`h-0.5 flex-1 rounded-full ${i < lesson.examWeight ? 'bg-cyan-500' : 'bg-slate-700'}`} />
          ))}
        </div>
        <div className="text-xs text-slate-600 mt-1">Exam weight: {lesson.examWeight}/5</div>
      </button>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100 mb-1">FT-2 Automata Lab</h1>
          <p className="text-slate-400 text-sm">Select a topic to enter the interactive learning environment.</p>
        </div>

        <div className="space-y-8">
          {[{ lessons: unit1, unit: 1 }, { lessons: unit2, unit: 2 }].map(({ lessons, unit }) => (
            <div key={unit}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-px flex-1 bg-gradient-to-r ${UNIT_COLORS[unit - 1]} opacity-40`} />
                <div className={`text-sm font-bold bg-gradient-to-r ${UNIT_COLORS[unit - 1]} bg-clip-text text-transparent flex items-center gap-2`}>
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  UNIT {unit} — {unit === 1 ? 'Finite Automata & Regular Languages' : 'Context-Free Languages'}
                </div>
                <div className={`h-px flex-1 bg-gradient-to-l ${UNIT_COLORS[unit - 1]} opacity-40`} />
              </div>
              <div className="space-y-2">
                {lessons.map((l, i) => renderLesson(l, i))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
