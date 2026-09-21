import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { FileText, Copy, Check, Sparkles } from 'lucide-react';
import { useCv } from '../context/CvContext';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, filter: 'blur(10px)' },
  in: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.4, ease: 'easeOut' } },
  out: { opacity: 0, scale: 1.02, filter: 'blur(10px)', transition: { duration: 0.3, ease: 'easeIn' } }
};

const ResumeForge = () => {
  const { bullets, globalLoading } = useCv();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <motion.div 
      variants={pageVariants} 
      initial="initial" 
      animate="in" 
      exit="out"
      className="max-w-4xl mx-auto h-full flex flex-col"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FileText className="text-primary" /> Resume <span className="text-gradient">Forge</span>
        </h1>
        <p className="text-slate-400 mt-2">STAR-method bullet points generated dynamically from your workflow.</p>
      </div>

      {globalLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : bullets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <FileText className="text-slate-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-300">Forge Idle</h2>
          <p className="text-slate-500 mt-2 max-w-md">No bullets generated. Upload your CV to forge high-impact bullet points.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto pr-4 space-y-6 pb-12">
          <AnimatePresence>
            {bullets.map((bullet, i) => (
              <GlassCard key={i} delay={0.1 * i} className="group hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-400 mt-1">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-200 text-lg leading-relaxed">{bullet}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(bullet, i)}
                    className="p-3 rounded-lg bg-slate-800/50 hover:bg-primary/20 hover:text-primary text-slate-400 transition-all active:scale-95 border border-transparent hover:border-primary/30"
                    title="Copy to clipboard"
                  >
                    {copiedIndex === i ? <Check size={20} className="text-success" /> : <Copy size={20} />}
                  </button>
                </div>
              </GlassCard>
            ))}
          </AnimatePresence>
          {bullets.length === 0 && (
             <div className="text-center text-slate-500 py-12">No resume bullets generated yet. Try connecting your GitHub/Jira or uploading a CV.</div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ResumeForge;
