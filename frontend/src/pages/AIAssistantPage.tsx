import React, { useState, useEffect } from 'react';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  Plus,
  BookOpen,
  MessageSquare,
  User,
  Clock,
} from 'lucide-react';
import { chatApi } from '@/services/api/chat';
import { ChatMessage, ChatSession } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { NotebookSurface } from '@/components/notebook/NotebookSurface';
import { PencilLoader } from '@/components/notebook/PencilLoader';
import { StickyNote } from '@/components/notebook/StickyNote';
import { toast } from '@/store/useToastStore';

export const AIAssistantPage: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      try {
        const res = await chatApi.getSessions(1, 20);
        const sessionItems = res.data?.items || (res as any).sessions || [];
        if (sessionItems.length > 0) {
          setSessions(sessionItems);
          setActiveSessionId(sessionItems[0].id);
          loadSessionMessages(sessionItems[0].id);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const res = await chatApi.getSession(sessionId);
      if (res.success && res.data?.messages) {
        setMessages(res.data.messages);
      }
    } catch {
      setMessages([]);
    }
  };

  const handleCreateSession = async () => {
    try {
      const res = await chatApi.createSession({ title: 'New Academic Chat' });
      if (res.success && res.data) {
        setSessions((prev) => [res.data!, ...prev]);
        setActiveSessionId(res.data.id);
        setMessages([]);
      }
    } catch {
      toast.error('Failed to create chat session.');
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    loadSessionMessages(sessionId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      try {
        const newSession = await chatApi.createSession({ title: inputText.substring(0, 30) });
        if (newSession.success && newSession.data) {
          targetSessionId = newSession.data.id;
          setActiveSessionId(targetSessionId);
          setSessions((prev) => [newSession.data!, ...prev]);
        }
      } catch {
        toast.error('Failed to initiate conversation.');
        return;
      }
    }

    const currentText = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id: Math.random().toString(),
      session_id: targetSessionId!,
      sender: 'USER',
      content: currentText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await chatApi.sendMessage(targetSessionId!, currentText);
      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsg.id),
          res.data!.user_message,
          res.data!.assistant_message,
        ]);
      }
    } catch {
      toast.error('Failed to get answer from AI Assistant.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f7f4ed]">
      <TopBar title="Academic RAG Assistant" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-handwriting font-bold text-3xl md:text-4xl text-ink flex items-center gap-2">
              <span>AI Study Assistant</span> 🤖
            </h1>
            <p className="text-xs md:text-sm text-slate-600 font-sans mt-0.5">
              Ask questions about exam patterns, subject topics, and past papers with grounded citations.
            </p>
          </div>

          <button
            onClick={handleCreateSession}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs font-sans"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Session History List */}
          <div className="lg:col-span-4 bg-white/80 rounded-2xl border border-stone-200/90 p-4 shadow-xs space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono mb-2 px-1">
              Conversations
            </div>

            {sessions.length > 0 ? (
              sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSession(s.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center gap-2.5 ${
                    activeSessionId === s.id
                      ? 'bg-brand-50 border-brand-300 text-brand-950 font-bold'
                      : 'bg-white border-stone-200 text-slate-700 hover:bg-stone-50'
                  }`}
                >
                  <MessageSquare size={14} className="shrink-0 text-brand-600" />
                  <span className="truncate">{s.title || 'Academic Session'}</span>
                </button>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400 font-sans">
                No chat sessions yet.
              </div>
            )}
          </div>

          {/* Right Main Chat Notebook */}
          <div className="lg:col-span-8">
            <NotebookSurface
              variant="ruled"
              hasSpiral={true}
              hasMarginLine={true}
              className="min-h-[520px] flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-300 pb-3 mb-4">
                  <span className="font-handwriting font-bold text-xl text-ink">
                    SGBAU Curriculum Knowledgebase 🎓
                  </span>
                  <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                    Grounded RAG
                  </span>
                </div>

                {/* Messages List */}
                <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-2">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 text-xs ${
                          msg.sender === 'USER' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.sender === 'ASSISTANT' && (
                          <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                            AI
                          </div>
                        )}
                        <div
                          className={`p-3.5 rounded-2xl max-w-lg leading-relaxed font-sans ${
                            msg.sender === 'USER'
                              ? 'bg-brand-600 text-white font-medium shadow-xs'
                              : 'bg-white/95 border border-stone-200 text-slate-900 shadow-xs font-serif'
                          }`}
                        >
                          {msg.content}

                          {msg.sources_cited && msg.sources_cited.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-stone-200/80">
                              <div className="font-mono text-[10px] text-slate-500 font-bold uppercase mb-1">
                                Cited Sources:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {msg.sources_cited.map((src: any, sIdx: number) => (
                                  <span
                                    key={sIdx}
                                    className="font-mono text-[10px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200"
                                  >
                                    Page {src.page || 1} • {src.paper_title || 'Paper'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 space-y-2">
                      <div className="text-3xl">✏️</div>
                      <h4 className="font-handwriting font-bold text-xl text-ink">
                        What would you like to study today?
                      </h4>
                      <p className="text-xs text-slate-500 font-sans max-w-sm mx-auto">
                        Ask about question patterns, mark distributions, specific topics, or algorithm explanations.
                      </p>
                    </div>
                  )}

                  {isSending && (
                    <div className="flex gap-3 text-xs">
                      <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 font-bold">
                        AI
                      </div>
                      <div className="p-3 bg-white/95 rounded-2xl border border-stone-200">
                        <PencilLoader size="xs" message="Retrieving knowledge & generating answer..." />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="relative mt-4">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask any question about syllabus or papers..."
                  className="w-full pl-4 pr-12 py-3 rounded-2xl border border-stone-300 bg-white text-xs font-sans text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-xs"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="absolute right-2 top-2 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl disabled:opacity-50 transition-colors shadow-xs"
                >
                  <Send size={14} />
                </button>
              </form>
            </NotebookSurface>
          </div>
        </div>
      </div>
    </div>
  );
};
