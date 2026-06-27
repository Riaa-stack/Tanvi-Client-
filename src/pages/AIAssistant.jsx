import React, { useState, useRef, useEffect } from 'react';
import { useSubject } from '../context/SubjectContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { api } from '../context/AuthContext.jsx';
import CompactToggle from '../components/CompactToggle.jsx';
import { Sparkles, Send, Bot, User, Trash2, HelpCircle, GraduationCap, RefreshCw, Star } from 'lucide-react';

export default function AIAssistant() {
  const { activeSubject } = useSubject();
  const { isCompact } = useTheme();
  
  // Chat state
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am EDUARCHIVE AI, your academic intelligence advisor. Ask me anything about previous year questions, unit weightages, or important exam topics, and I will parse your syllabus to give you precise, data-backed predictions!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Preset quick chips
  const presetChips = activeSubject ? [
    `What are the most important ${activeSubject.code} topics?`,
    `Predict the high weightage units for ESE.`,
    `Which questions appear most frequently?`,
    `Explain the concept of Unit 1 in detail.`
  ] : [
    "How does EduArchive analyze papers?",
    "What subjects are supported?"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e, textPrompt) => {
    if (e) e.preventDefault();
    const finalPrompt = textPrompt || input;
    if (!finalPrompt.trim() || loading) return;

    // Clear main input
    if (!textPrompt) setInput('');

    // Append user message
    const userMsg = { role: 'user', content: finalPrompt };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.post('/api/ai/chat', {
        message: finalPrompt,
        history: messages,
        subject_id: activeSubject?.id
      });

      // Append assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error contacting the AI core: ${err.response?.data?.error || err.message}. Please verify your GEMINI_API_KEY inside the Secrets panel.` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Hello! I am ready to advise you on ${activeSubject ? activeSubject.name : 'your studies'}. What academic predictions can I run for you today?`
      }
    ]);
  };

  return (
    <div className={`flex flex-col ${isCompact ? 'h-[calc(100vh-160px)] space-y-3' : 'h-[calc(100vh-140px)] space-y-4'} font-sans`}>
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500 fill-blue-500" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">AI Academic Intelligence Assistant</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {activeSubject 
              ? `Answering queries with active context of ${activeSubject.name} (${activeSubject.code})` 
              : "Answering general academic and platform operations queries"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CompactToggle />
          <button
            onClick={handleClearChat}
            className="p-2 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 text-slate-400 dark:text-slate-500 rounded-sm transition-all cursor-pointer flex items-center gap-1 text-xs font-bold font-mono"
            title="Clear Chat Logs"
          >
            <Trash2 className="h-4 w-4" />
            Clear Log
          </button>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-grow overflow-y-auto py-4 space-y-4 pr-1 mt-2">
        {messages.map((msg, idx) => {
          const isBot = msg.role === 'assistant';
          return (
            <div key={idx} className={`flex gap-3.5 max-w-4xl ${isBot ? '' : 'ml-auto flex-row-reverse'}`}>
              {/* Avatar */}
              <div className={`h-8 w-8 rounded-sm flex items-center justify-center shrink-0 shadow-sm ${
                isBot 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-white font-bold text-xs'
              }`}>
                {isBot ? <Bot className="h-4 w-4" /> : 'S'}
              </div>

              {/* Message bubble */}
              <div className={`p-4 rounded-sm text-xs leading-relaxed space-y-2 border ${
                isBot 
                  ? 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-250 shadow-sm' 
                  : 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
              }`}>
                <p className="whitespace-pre-line font-medium leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing Loader */}
        {loading && (
          <div className="flex gap-3.5">
            <div className="h-8 w-8 rounded-sm bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 rounded-sm flex items-center gap-1.5 shadow-sm">
              <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce"></span>
              <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Chips suggestions */}
      <div className="py-2.5 flex flex-wrap items-center gap-2 border-t border-slate-200 dark:border-slate-800 mt-auto">
        {presetChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(null, chip)}
            className="text-[11px] font-bold px-3 py-1.5 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/40 dark:hover:bg-blue-950/30 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-sm border border-slate-200 dark:border-slate-800 transition-all cursor-pointer flex items-center gap-1 font-mono"
          >
            <HelpCircle className="h-3 w-3 text-slate-400 dark:text-slate-500" />
            {chip}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex gap-2.5 pt-2">
        <input
          type="text"
          placeholder={activeSubject ? `Ask about syllabus weightages, core papers, or predictions for ${activeSubject.code}...` : "Choose a subject to activate deep database context and ask questions..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-sm py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white transition-all font-semibold font-sans"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-sm shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
}
