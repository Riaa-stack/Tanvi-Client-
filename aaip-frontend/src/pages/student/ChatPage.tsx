import React, { useState, useRef, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuthStore } from '@/store/auth.store'
import { useSSE } from '@/hooks/useSSE'
import { Button } from '@/components/ui/Button'
import { Send, User as UserIcon, Bot, RefreshCw } from 'lucide-react'
import { ChatMessage } from '@/types/models'

export default function ChatPage() {
  const { subjectId } = useParams()
  const [searchParams] = useSearchParams()
  const initialQ = searchParams.get('q')
  const { user } = useAuthStore()
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Tutor. I can help you understand concepts, solve past paper questions, or explain topics from your syllabus. What would you like to discuss?',
      timestamp: new Date().toISOString()
    }
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Trigger initial query if passed via URL
  useEffect(() => {
    if (initialQ && messages.length === 1) {
      handleSend(initialQ)
    }
  }, [initialQ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isStreaming])

  // Custom SSE implementation logic for chat is best handled inline or via the hook
  // We'll use the hook we created, but hook rules require it at top level.
  // We need to trigger the hook when currentPrompt is set.
  
  const sse = useSSE('/api/v1/chat', !!currentPrompt, { message: currentPrompt, subject_id: subjectId || '' })

  useEffect(() => {
    if (currentPrompt && sse.tokens) {
      // Update the last message (which should be the assistant's placeholder)
      setMessages(prev => {
        const newMsg = [...prev]
        if (newMsg[newMsg.length - 1].role === 'assistant') {
          newMsg[newMsg.length - 1].content = sse.tokens
        }
        return newMsg
      })
    }
    
    if (sse.isDone || sse.error) {
      setIsStreaming(false)
      setCurrentPrompt(null)
      sse.reset()
    }
  }, [sse.tokens, sse.isDone, sse.error])

  const handleSend = (text: string = input) => {
    if (!text.trim() || isStreaming) return
    
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() }
    const aiPlaceholder: ChatMessage = { role: 'assistant', content: '', timestamp: new Date().toISOString() }
    
    setMessages(prev => [...prev, userMsg, aiPlaceholder])
    setInput('')
    setIsStreaming(true)
    setCurrentPrompt(text)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height)-3rem)] max-h-[800px]">
      <PageHeader 
        title="AI Tutor" 
        subtitle={subjectId ? "Ask questions contextually aware of this subject's past papers." : "Ask questions across all your subjects."}
      />

      <div className="flex-1 bg-surface-card border border-default rounded-t-md overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-surface-sunken text-primary border border-default'
            }`}>
              {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-brand-primary text-white rounded-tr-sm' 
                : 'bg-surface-sunken text-primary rounded-tl-sm border border-default'
            }`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content}
                {msg.role === 'assistant' && isStreaming && idx === messages.length - 1 && (
                  <span className="inline-block w-2 h-4 ml-1 bg-brand-primary animate-pulse" />
                )}
              </div>
            </div>
          </div>
        ))}
        {sse.error && (
          <div className="text-center text-sm text-danger p-2 bg-danger-bg rounded-md">
            Error: {sse.error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-surface-card border-x border-b border-default rounded-b-md p-4">
        <form 
          className="relative flex items-center"
          onSubmit={e => { e.preventDefault(); handleSend(); }}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder="Type your question..."
            className="w-full bg-surface-page border border-default rounded-full pl-4 pr-12 py-3 text-sm focus-ring disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 p-2 text-brand-primary hover:bg-brand-accent rounded-full disabled:opacity-50 transition-colors"
          >
            {isStreaming ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  )
}