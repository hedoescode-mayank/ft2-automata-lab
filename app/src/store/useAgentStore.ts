import { create } from 'zustand';
import { fetchAgentResponse, type ChatMessage } from '../core/agent/agent';

interface AgentState {
  isOpen: boolean;
  isThinking: boolean;
  messages: ChatMessage[];
  currentContext: string;
  hasGreeted: boolean;
  
  toggleOpen: () => void;
  setContext: (context: string) => void;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  isOpen: false,
  isThinking: false,
  messages: [
    { role: 'assistant', content: 'Hi there! I am your AI Tutor. I will guide you through this Automata Lab. Ask me anything about what you see on the screen!' }
  ],
  currentContext: 'Automata Lab Dashboard',
  hasGreeted: false,

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  
  setContext: async (context: string) => {
    const state = get();
    if (state.currentContext === context && state.hasGreeted) return;
    
    set({ currentContext: context, hasGreeted: true, isThinking: true });

    // When context changes, we ask the agent to proactively explain the new screen
    const prompt = `I just opened the ${context}. Briefly tell me in 1 or 2 sentences what this screen is for and what I can do here.`;
    
    try {
      // Create a temporary history just for this background request so we don't clutter the actual chat history with the raw prompt
      const rawResponse = await fetchAgentResponse([{ role: 'user', content: prompt }], context);
      
      set((prev) => ({
        messages: [...prev.messages, { role: 'assistant', content: rawResponse }],
        isThinking: false,
        isOpen: true // Automatically pop open when moving to a new section to show the tutorial text
      }));
    } catch (e) {
      set({ isThinking: false });
    }
  },

  sendMessage: async (text: string) => {
    const userMsg: ChatMessage = { role: 'user', content: text };
    
    set((state) => ({
      messages: [...state.messages, userMsg],
      isThinking: true
    }));

    const currentHistory = get().messages;
    const context = get().currentContext;

    const response = await fetchAgentResponse(currentHistory, context);

    set((state) => ({
      messages: [...state.messages, { role: 'assistant', content: response }],
      isThinking: false
    }));
  },

  clearHistory: () => set({ 
    messages: [{ role: 'assistant', content: 'Chat history cleared. How can I help?' }]
  })
}));
