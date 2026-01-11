import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'مرحباً! أنا مساعدك الذكي المتخصص في السينما. كيف يمكنني مساعدتك في تحليل السيناريو اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session only once with error handling
    if (!chatSessionRef.current) {
      try {
        chatSessionRef.current = createChatSession();
      } catch (error) {
        console.error('Failed to initialize chat session:', error);
        setMessages(prev => [...prev, {
          id: '2',
          role: 'model',
          text: 'عذراً، لم يتمكن التطبيق من الاتصال بخدمة الذكاء الاصطناعي. تأكد من تعيين مفتاح API الصحيح.'
        }]);
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) {
        try {
          chatSessionRef.current = createChatSession();
        } catch (initError) {
          console.error('Failed to initialize chat session:', initError);
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            text: 'عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً.' 
          }]);
          return;
        }
      }

      // Add placeholder for streaming response
      const botMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: botMessageId, role: 'model', text: '' }]);

      const result = await chatSessionRef.current.sendMessageStream({ message: userMessage.text });
      
      let fullText = '';
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || '';
        fullText += text;
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, text: fullText } : msg
        ));
      }

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: `عذراً، حدث خطأ: ${errorMessage}. يرجى المحاولة مرة أخرى.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-xl transition-all hover:scale-110 flex items-center justify-center border border-blue-400/30"
        title="المساعد الذكي"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-[85vw] md:w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[600px] h-[70vh] animate-fadeIn">
          {/* Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-600/30">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">المساعد الذكي</h3>
              <p className="text-xs text-slate-400">مدعوم بواسطة Gemini 3</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0 border
                  ${msg.role === 'user' 
                    ? 'bg-indigo-600 border-indigo-500' 
                    : 'bg-slate-700 border-slate-600'}
                `}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-blue-400" />}
                </div>
                <div className={`
                  p-3 rounded-2xl text-sm leading-relaxed max-w-[80%] whitespace-pre-wrap
                  ${msg.role === 'user' 
                    ? 'bg-indigo-600/20 text-indigo-100 rounded-tr-none border border-indigo-500/30' 
                    : 'bg-slate-700/50 text-slate-200 rounded-tl-none border border-slate-600'}
                `}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
               <div className="flex gap-3 flex-row">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-slate-700 border-slate-600">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-slate-900 border-t border-slate-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اطرح سؤالك هنا..."
              className="flex-1 bg-slate-800 border-slate-700 text-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5 rtl:rotate-180" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;