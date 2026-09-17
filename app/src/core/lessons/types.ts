export type LessonId =
  | 'dfa'
  | 'nfa'
  | 'enfa'
  | 'epsilon-closure'
  | 'nfa-to-dfa'
  | 'minimization'
  | 'regex'
  | 're-to-fa'
  | 'fa-to-re'
  | 'equivalence'
  | '2dfa'
  | 'moore'
  | 'mealy'
  | 'cfg'
  | 'derivations'
  | 'ambiguity'
  | 'cfg-simplification'
  | 'cnf';

export type WorkspaceType =
  | 'automata'
  | 'nfa-to-dfa-lab'
  | 'minimization-lab'
  | 'regex-lab'
  | 'equivalence-arena'
  | 'tape-2dfa'
  | 'moore-mealy'
  | 'grammar'
  | 'cnf';

export interface LessonStep {
  type: 'why' | 'intuition' | 'formal' | 'example' | 'interactive' | 'guided' | 'independent' | 'exam' | 'mistakes';
  title: string;
  /** Plain text or markdown. Use $...$ for inline math, $$...$$ for block. */
  content: string;
  /** Optional: pre-built automaton JSON string to load into the canvas for this step */
  preloadAutomaton?: string;
  /** Optional: multiple-choice question for quick checks */
  checkQuestion?: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
}

export interface Lesson {
  id: LessonId;
  unit: 1 | 2;
  title: string;
  subtitle: string;
  prerequisites: LessonId[];
  objective: string;
  workspace: WorkspaceType;
  steps: LessonStep[];
  commonMistakes: string[];
  masteryCriteria: string[];
  examWeight: number; // 1–5
}
