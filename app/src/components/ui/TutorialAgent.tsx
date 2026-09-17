import { useState, useRef, useEffect } from 'react';
import { useAgentStore } from '../../store/useAgentStore';
import { Bot, X, Send, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const TutorialAgent = () => {
  const { isOpen, toggleOpen, messages, isThinking, sendMessage, clearHistory } = useAgentStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isThinking]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    sendMessage(input);
    setInput('');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-end gap-4 animate-in slide-in-from-bottom-4">
        {/* Chat Bubble Teaser */}
        {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
          <div className="bg-slate-800 border border-fuchsia-500/50 shadow-2xl shadow-fuchsia-900/20 p-4 rounded-2xl rounded-br-sm max-w-xs cursor-pointer hover:bg-slate-700 transition-colors" onClick={toggleOpen}>
            <p className="text-sm text-slate-300 line-clamp-3">
              {messages[messages.length - 1].content}
            </p>
          </div>
        )}
        
        {/* Avatar Button */}
        <button 
          onClick={toggleOpen}
          className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-fuchsia-600 to-cyan-500 p-0.5 shadow-xl shadow-fuchsia-900/30 hover:scale-105 transition-transform"
        >
          <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
            {isThinking ? (
              <Loader2 className="w-6 h-6 text-fuchsia-400 animate-spin" />
            ) : (
              <Bot className="w-6 h-6 text-fuchsia-400 group-hover:text-cyan-400 transition-colors" />
            )}
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[32rem] bg-slate-900 border border-fuchsia-500/50 rounded-2xl shadow-2xl shadow-fuchsia-900/30 flex flex-col overflow-hidden animate-in zoom-in-95 origin-bottom-right">
      {/* Header */}
      <div className="h-14 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-600 to-cyan-500 p-0.5">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-fuchsia-400" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              FT-2 Tutor <Sparkles className="w-3 h-3 text-cyan-400" />
            </h3>
            <p className="text-[10px] text-emerald-400">Online & Ready to Help</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearHistory} className="p-1.5 text-slate-500 hover:text-slate-300 rounded transition-colors" title="Clear Chat">
            <MessageSquare className="w-4 h-4" />
          </button>
          <button onClick={toggleOpen} className="p-1.5 text-slate-500 hover:text-white rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50 scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-md ${
              msg.role === 'user' 
                ? 'bg-fuchsia-600 text-white rounded-br-sm' 
                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 text-slate-400 rounded-2xl rounded-bl-sm p-3 text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me how this works..."
          disabled={isThinking}
          className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-fuchsia-500 disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={!input.trim() || isThinking}
          className="p-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-500 disabled:opacity-50 disabled:hover:bg-fuchsia-600 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
