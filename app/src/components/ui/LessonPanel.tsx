import { useState, type ReactElement } from 'react';
import type { Lesson, LessonStep } from '../../core/lessons/types';
import {
  HelpCircle, Lightbulb, BookOpen, FlaskConical, Hand, Target,
  GraduationCap, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle, XCircle
} from 'lucide-react';

interface Props {
  lesson: Lesson;
  onLoadAutomaton?: (json: string) => void;
}

const STEP_ICONS: Record<LessonStep['type'], ReactElement> = {
  why:         <HelpCircle className="w-4 h-4" />,
  intuition:   <Lightbulb className="w-4 h-4" />,
  formal:      <BookOpen className="w-4 h-4" />,
  example:     <FlaskConical className="w-4 h-4" />,
  interactive: <FlaskConical className="w-4 h-4" />,
  guided:      <Hand className="w-4 h-4" />,
  independent: <Target className="w-4 h-4" />,
  exam:        <GraduationCap className="w-4 h-4" />,
  mistakes:    <AlertTriangle className="w-4 h-4" />,
};

const STEP_COLORS: Record<LessonStep['type'], string> = {
  why:         'text-amber-400 bg-amber-400/10 border-amber-400/30',
  intuition:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  formal:      'text-blue-400 bg-blue-400/10 border-blue-400/30',
  example:     'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  interactive: 'text-teal-400 bg-teal-400/10 border-teal-400/30',
  guided:      'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  independent: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
  exam:        'text-rose-400 bg-rose-400/10 border-rose-400/30',
  mistakes:    'text-orange-400 bg-orange-400/10 border-orange-400/30',
};

const STEP_LABELS: Record<LessonStep['type'], string> = {
  why:         'Why?',
  intuition:   'Intuition',
  formal:      'Formal Definition',
  example:     'Worked Example',
  interactive: 'Interactive Example',
  guided:      'Guided Practice',
  independent: 'Independent Practice',
  exam:        'Exam Question',
  mistakes:    'Common Mistakes',
};

/** Very simple markdown renderer supporting bold, inline code, tables, and newlines */
const renderContent = (text: string): ReactElement[] => {
  const lines = text.split('\n');
  const output: ReactElement[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let key = 0;

  const flushTable = () => {
    if (tableRows.length < 2) return;
    const [headerRow, , ...bodyRows] = tableRows; // skip separator row
    output.push(
      <table key={key++} className="w-full text-sm border-collapse my-3">
        <thead>
          <tr>{headerRow.map((cell, i) => (
            <th key={i} className="border border-slate-600 px-3 py-1 text-left text-slate-300 bg-slate-700/50">{cell.trim()}</th>
          ))}</tr>
        </thead>
        <tbody>
          {bodyRows.map((row, i) => (
            <tr key={i} className="border-b border-slate-700">
              {row.map((cell, j) => (
                <td key={j} className="border border-slate-600 px-3 py-1 text-slate-400">{cell.trim()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
    tableRows = [];
    inTable = false;
  };

  const renderInline = (s: string): (string | ReactElement)[] => {
    // Handle **bold**, `code`, and $math$ inline
    const parts: (string | ReactElement)[] = [];
    let remaining = s;
    let k = 0;
    while (remaining.length > 0) {
      const boldIdx = remaining.indexOf('**');
      const codeIdx = remaining.indexOf('`');
      const mathIdx = remaining.indexOf('$');

      const indices = [boldIdx, codeIdx, mathIdx].filter(i => i !== -1);
      if (indices.length === 0) { parts.push(remaining); break; }
      const first = Math.min(...indices);

      if (first > 0) parts.push(remaining.slice(0, first));
      remaining = remaining.slice(first);

      if (remaining.startsWith('**')) {
        const end = remaining.indexOf('**', 2);
        if (end === -1) { parts.push(remaining); break; }
        parts.push(<strong key={k++} className="text-slate-100 font-semibold">{remaining.slice(2, end)}</strong>);
        remaining = remaining.slice(end + 2);
      } else if (remaining.startsWith('`')) {
        const end = remaining.indexOf('`', 1);
        if (end === -1) { parts.push(remaining); break; }
        parts.push(<code key={k++} className="bg-slate-700 text-cyan-300 px-1 rounded text-xs font-mono">{remaining.slice(1, end)}</code>);
        remaining = remaining.slice(end + 1);
      } else if (remaining.startsWith('$')) {
        const end = remaining.indexOf('$', 1);
        if (end === -1) { parts.push(remaining); break; }
        parts.push(<code key={k++} className="text-amber-300 font-mono text-xs">{remaining.slice(1, end)}</code>);
        remaining = remaining.slice(end + 1);
      } else {
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      }
    }
    return parts;
  };

  for (const line of lines) {
    if (line.includes('|') && line.trim().startsWith('|')) {
      const cells = line.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1);
      if (!inTable) inTable = true;
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (line.trim() === '') {
      output.push(<div key={key++} className="h-2" />);
    } else if (line.startsWith('## ')) {
      output.push(<h2 key={key++} className="text-base font-bold text-slate-200 mt-3 mb-1">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      output.push(<h3 key={key++} className="text-sm font-semibold text-slate-300 mt-2 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      output.push(
        <li key={key++} className="ml-4 text-slate-400 text-sm list-disc mb-0.5">
          {renderInline(line.slice(2))}
        </li>
      );
    } else if (/^\d+\. /.test(line)) {
      output.push(
        <li key={key++} className="ml-4 text-slate-400 text-sm list-decimal mb-0.5">
          {renderInline(line.replace(/^\d+\. /, ''))}
        </li>
      );
    } else if (line.startsWith('```')) {
      // skip fence markers
    } else {
      output.push(
        <p key={key++} className="text-slate-400 text-sm leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  }
  if (inTable) flushTable();
  return output;
};

const CheckQuestion = ({ q }: { q: NonNullable<LessonStep['checkQuestion']> }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = selected === q.correct;

  return (
    <div className="mt-4 bg-slate-900 rounded-lg border border-slate-700 p-4">
      <p className="text-sm font-semibold text-slate-200 mb-3">🎯 Quick Check: {q.question}</p>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let cls = 'border border-slate-600 text-slate-400';
          if (submitted && i === q.correct) cls = 'border border-emerald-500 bg-emerald-900/30 text-emerald-300';
          else if (submitted && i === selected && !isCorrect) cls = 'border border-rose-500 bg-rose-900/30 text-rose-400';
          else if (selected === i) cls = 'border border-cyan-500 bg-cyan-900/20 text-cyan-300';

          return (
            <button
              key={i}
              onClick={() => !submitted && setSelected(i)}
              className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {!submitted && selected !== null && (
        <button
          onClick={() => setSubmitted(true)}
          className="mt-3 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-sm"
        >
          Check
        </button>
      )}
      {submitted && (
        <div className={`mt-3 flex items-start gap-2 text-xs rounded-lg p-3 ${isCorrect ? 'bg-emerald-900/30 text-emerald-300' : 'bg-rose-900/30 text-rose-300'}`}>
          {isCorrect ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
          <span>{q.explanation}</span>
        </div>
      )}
    </div>
  );
};

export const LessonPanel = ({ lesson, onLoadAutomaton }: Props) => {
  const [stepIndex, setStepIndex] = useState(0);
  const step = lesson.steps[stepIndex];
  const colorClass = STEP_COLORS[step.type];

  const handleNext = () => {
    if (step.preloadAutomaton && onLoadAutomaton) {
      onLoadAutomaton(step.preloadAutomaton);
    }
    if (stepIndex < lesson.steps.length - 1) setStepIndex(stepIndex + 1);
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 border-r border-slate-700 w-80 shrink-0 overflow-hidden">
      {/* Lesson Header */}
      <div className="p-4 border-b border-slate-700 shrink-0">
        <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">
          Unit {lesson.unit}
        </div>
        <h2 className="text-base font-bold text-slate-100">{lesson.title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{lesson.subtitle}</p>

        {/* Step progress dots */}
        <div className="flex gap-1 mt-3 flex-wrap">
          {lesson.steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setStepIndex(i)}
              title={STEP_LABELS[s.type]}
              className={`w-2 h-2 rounded-full transition-all ${i === stepIndex ? 'w-6 bg-cyan-400' : i < stepIndex ? 'bg-slate-500' : 'bg-slate-700'}`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Step type badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium mb-3 ${colorClass}`}>
          {STEP_ICONS[step.type]}
          {STEP_LABELS[step.type]}
        </div>

        <h3 className="text-sm font-bold text-slate-100 mb-3">{step.title}</h3>

        <div className="space-y-1">
          {renderContent(step.content)}
        </div>

        {step.checkQuestion && (
          <CheckQuestion q={step.checkQuestion} />
        )}

        {step.preloadAutomaton && onLoadAutomaton && (
          <button
            onClick={() => onLoadAutomaton(step.preloadAutomaton!)}
            className="mt-4 w-full text-xs py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 transition-colors"
          >
            ↗ Load Example into Canvas
          </button>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="border-t border-slate-700 p-3 flex items-center justify-between shrink-0">
        <button
          onClick={() => setStepIndex(i => Math.max(0, i - 1))}
          disabled={stepIndex === 0}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-slate-300"
        >
          <ChevronLeft className="w-3 h-3" /> Back
        </button>

        <span className="text-xs text-slate-500">{stepIndex + 1} / {lesson.steps.length}</span>

        <button
          onClick={handleNext}
          disabled={stepIndex === lesson.steps.length - 1}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white"
        >
          Next <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
