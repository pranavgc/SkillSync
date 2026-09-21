import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { MessageSquare, Send, Sparkles, Cpu } from 'lucide-react';
import { useCv } from '../context/CvContext';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, filter: 'blur(10px)' },
  in: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.4, ease: 'easeOut' } },
  out: { opacity: 0, scale: 1.02, filter: 'blur(10px)', transition: { duration: 0.3, ease: 'easeIn' } }
};

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const AiMentor = () => {
  const { careerPath } = useCv();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Welcome to your career command center. I've analyzed your skill tree and the current market conditions. How can I assist with your progression today?", sender: 'ai' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    // Mock AI Response
    setTimeout(() => {
      const target = careerPath?.target_role || "your next role";
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `To preserve your free-tier API rate limits for the core CV analysis pipeline, live open-ended chatting is currently disabled. For tailored advice on reaching ${target}, please refer to your Career Radar roadmap!`,
        sender: 'ai'
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <motion.div 
      variants={pageVariants} 
      initial="initial" 
      animate="in" 
      exit="out"
      className="max-w-5xl mx-auto h-full flex gap-6 pb-6"
    >
      <div className="flex-1 flex flex-col h-full min-h-0">
        <div className="mb-4 flex-shrink-0">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="text-accent" /> AI <span className="text-gradient">Mentor</span>
          </h1>
          <p className="text-slate-400 mt-2">Context-aware guidance based on your live skill data.</p>
        </div>

        <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden mb-8 min-h-0 relative">
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'ai' ? 'bg-primary/20 text-primary border border-primary/50' : 'bg-slate-700 text-slate-300'}`}>
                  {msg.sender === 'ai' ? <Cpu size={16} /> : <div className="w-4 h-4 rounded-full bg-slate-400" />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-slate-700/50 text-white rounded-tr-sm border border-slate-600' 
                    : 'bg-primary/10 text-slate-200 border border-primary/20 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/50 flex items-center justify-center">
                  <Cpu size={16} />
                </div>
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-primary rounded-full" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-primary rounded-full" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-700/50 bg-slate-900/50 flex-shrink-0">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your mentor..." 
                className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl py-4 pl-6 pr-14 focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button 
                type="submit" 
                disabled={!input.trim()}
                className="absolute right-2 p-2 bg-primary text-slate-900 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </GlassCard>
      </div>

      {/* Smart Recommendations Sidebar */}
      <div className="w-80 hidden lg:flex flex-col gap-4 pt-20">
        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Sparkles size={14} className="text-accent" /> Smart Prompts
        </div>
        {[
          "Analyze my latest GitHub commits",
          "Identify gaps for Staff Engineer",
          "Mock interview me for System Design"
        ].map((prompt, i) => (
          <GlassCard key={i} delay={0.2 + (i * 0.1)} className="p-4 cursor-pointer group">
            <div className="text-sm text-slate-300 group-hover:text-primary transition-colors" onClick={() => setInput(prompt)}>
              "{prompt}"
            </div>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  );
};

export default AiMentor;
