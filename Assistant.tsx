import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from '../components/Layout';
import { Sparkles, Send, Bot, User, History, Trash2, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { useAuth } from '../context/AuthContext';
import { ai, MODELS, safetySettings } from '../lib/gemini';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

import { PremiumLoadingOverlay } from '../components/PremiumLoadingOverlay';

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I am Vaikunth AI. How can I assist with your creative vision today?",
      timestamp: new Date(),
      suggestions: ["How to write better prompts?", "Create a cyberpunk city idea", "Audio style suggestions"]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { profile } = useAuth();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: MODELS.TEXT,
        contents: text,
        config: {
          safetySettings: safetySettings,
          systemInstruction: "You are Vaikunth AI. You are premium, sophisticated, and helpful. You help users with prompts, ideas, and technical guidance for images and audio. Keep responses concise but inspiring. End with 2-3 short clickable suggestions."
        }
      });
      
      const textResponse = response.text;

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: textResponse || "I'm sorry, I couldn't process that vision. Let's try another approach.",
        timestamp: new Date(),
        // Simple logic for suggestions extraction from text if needed, or just default ones
        suggestions: ["Explain techniques", "Give prompt example"]
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Layout>
      <PremiumLoadingOverlay isVisible={isTyping} message="Orchestrating Thoughts..." />
      <div className="h-screen flex flex-col bg-black overflow-hidden">
        {/* Header */}
        <header className="p-4 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
                <ChevronLeft size={24} />
             </Button>
             <h1 className="text-base font-bold tracking-tight text-white/90">Vaikunth AI</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white" onClick={() => setMessages([messages[0]])}>
             <Trash2 size={18} />
          </Button>
        </header>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-6" viewportRef={scrollRef}>
           <div className="space-y-8 pb-32 max-w-2xl mx-auto">
             {messages.map((msg) => (
               <motion.div 
                 key={msg.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={cn(
                   "flex flex-col gap-2",
                   msg.role === 'user' ? "items-end" : "items-start"
                 )}
               >
                 <div className={cn(
                   "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed",
                   msg.role === 'user' 
                    ? "bg-purple-600 text-white rounded-tr-none shadow-[0_10px_20px_rgba(124,58,237,0.2)]" 
                    : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-none backdrop-blur-md"
                 )}>
                    {msg.content}
                 </div>
                 
                 {msg.role === 'assistant' && msg.suggestions && (
                    <div className="flex flex-wrap gap-2 mt-2">
                       {msg.suggestions.map((s, i) => (
                         <Button 
                           key={i} 
                           variant="outline" 
                           size="sm"
                           onClick={() => handleSend(s)}
                           className="text-[10px] bg-black border-white/10 text-gray-400 rounded-full hover:bg-purple-600 hover:text-white hover:border-purple-500 h-8"
                         >
                           {s} <ArrowRight size={10} className="ml-1" />
                         </Button>
                       ))}
                    </div>
                 )}
               </motion.div>
             ))}

             {isTyping && (
               <div className="flex items-start gap-2">
                 <div className="bg-white/5 border border-white/10 p-4 rounded-3xl rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                 </div>
               </div>
             )}
           </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="fixed bottom-24 left-0 right-0 p-6 z-20">
           <div className="max-w-2xl mx-auto glass p-2 rounded-[2rem] flex items-center gap-2 shadow-2xl">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Vaikunth AI anything..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-white px-4 text-sm font-medium"
              />
              <Button 
                onClick={() => handleSend()}
                className="bg-purple-600 hover:bg-purple-500 h-12 w-12 rounded-full flex items-center justify-center p-0 purple-glow"
              >
                <Send size={20} />
              </Button>
           </div>
        </div>
      </div>
    </Layout>
  );
}
