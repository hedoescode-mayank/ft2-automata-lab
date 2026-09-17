import { create } from 'zustand';
import type { Automaton, State } from '../core/automata/types';

type ViewMode = 'map' | 'workspace';

interface AppState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentZone: string | null;
  setCurrentZone: (zoneId: string | null) => void;
  xp: number;
  addXp: (amount: number) => void;
  
  // Automaton State
  automaton: Automaton;
  setAutomaton: (automaton: Automaton) => void;
  
  // Graph Interaction Actions
  addState: (x: number, y: number) => void;
  updateStatePosition: (id: string, x: number, y: number) => void;
  updateStateProperties: (id: string, updates: Partial<State>) => void;
  deleteState: (id: string) => void;
  
  addTransition: (from: string, to: string, symbols: string[]) => void;
  updateTransition: (id: string, symbols: string[]) => void;
  deleteTransition: (id: string) => void;
  
  // Table Sync
  updateFromTable: (stateId: string, symbol: string, targets: string[]) => void;
}

export const useStore = create<AppState>((set) => ({
  viewMode: 'map',
  setViewMode: (mode) => set({ viewMode: mode }),
  currentZone: null,
  setCurrentZone: (zoneId) => set({ currentZone: zoneId }),
  xp: 0,
  addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
  
  automaton: {
    type: 'DFA',
    alphabet: ['0', '1'],
    states: [],
    transitions: [],
    initialState: null
  },
  setAutomaton: (automaton) => set({ automaton }),
  
  addState: (x, y) => set((state) => {
    const newId = `q${state.automaton.states.length}`;
    const isFirst = state.automaton.states.length === 0;
    return {
      automaton: {
        ...state.automaton,
        states: [...state.automaton.states, { id: newId, label: newId, x, y, initial: isFirst, accepting: false }],
        initialState: isFirst ? newId : state.automaton.initialState
      }
    };
  }),

  updateStatePosition: (id, x, y) => set((state) => ({
    automaton: {
      ...state.automaton,
      states: state.automaton.states.map(s => s.id === id ? { ...s, x, y } : s)
    }
  })),

  updateStateProperties: (id, updates) => set((state) => {
    let newStates = state.automaton.states.map(s => s.id === id ? { ...s, ...updates } : s);
    let newInitial = state.automaton.initialState;
    
    // If making a state initial in a DFA, remove initial from others
    if (updates.initial && state.automaton.type === 'DFA') {
      newStates = newStates.map(s => s.id !== id ? { ...s, initial: false } : s);
      newInitial = id;
    } else if (updates.initial === false && state.automaton.initialState === id) {
      newInitial = null;
    }

    return {
      automaton: {
        ...state.automaton,
        states: newStates,
        initialState: newInitial
      }
    };
  }),

  deleteState: (id) => set((state) => ({
    automaton: {
      ...state.automaton,
      states: state.automaton.states.filter(s => s.id !== id),
      transitions: state.automaton.transitions.filter(t => t.from !== id && t.to !== id),
      initialState: state.automaton.initialState === id ? null : state.automaton.initialState
    }
  })),

  addTransition: (from, to, symbols) => set((state) => {
    // Check if transition already exists
    const existingIndex = state.automaton.transitions.findIndex(t => t.from === from && t.to === to);
    if (existingIndex >= 0) {
      const newTransitions = [...state.automaton.transitions];
      newTransitions[existingIndex] = {
        ...newTransitions[existingIndex],
        symbols: Array.from(new Set([...newTransitions[existingIndex].symbols, ...symbols]))
      };
      return { automaton: { ...state.automaton, transitions: newTransitions } };
    }
    return {
      automaton: {
        ...state.automaton,
        transitions: [...state.automaton.transitions, { id: `t${Date.now()}`, from, to, symbols }]
      }
    };
  }),

  updateTransition: (id, symbols) => set((state) => {
    if (symbols.length === 0) {
      return {
        automaton: {
          ...state.automaton,
          transitions: state.automaton.transitions.filter(t => t.id !== id)
        }
      };
    }
    return {
      automaton: {
        ...state.automaton,
        transitions: state.automaton.transitions.map(t => t.id === id ? { ...t, symbols } : t)
      }
    };
  }),

  deleteTransition: (id) => set((state) => ({
    automaton: {
      ...state.automaton,
      transitions: state.automaton.transitions.filter(t => t.id !== id)
    }
  })),

  updateFromTable: (stateId, symbol, targetLabels) => set((state) => {
    // This requires looking up target IDs by label
    const targetIds = targetLabels
      .map(lbl => {
        const found = state.automaton.states.find(s => s.id === lbl || s.label.toLowerCase() === lbl.toLowerCase());
        return found?.id;
      })
      .filter(Boolean) as string[];

    // Remove existing transitions from this state for this symbol
    let newTransitions = state.automaton.transitions.map(t => {
      if (t.from === stateId && t.symbols.includes(symbol)) {
        return { ...t, symbols: t.symbols.filter(sym => sym !== symbol) };
      }
      return t;
    }).filter(t => t.symbols.length > 0); // Cleanup empty transitions

    // Add new transitions
    targetIds.forEach(targetId => {
      const existing = newTransitions.find(t => t.from === stateId && t.to === targetId);
      if (existing) {
        existing.symbols.push(symbol);
      } else {
        newTransitions.push({ id: `t${Date.now()}_${Math.random()}`, from: stateId, to: targetId, symbols: [symbol] });
      }
    });

    return { automaton: { ...state.automaton, transitions: newTransitions } };
  }),
}));
