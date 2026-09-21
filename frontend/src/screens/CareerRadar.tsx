import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { Target, ArrowRight, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { useCv } from '../context/CvContext';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, filter: 'blur(10px)' },
  in: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.4, ease: 'easeOut' } },
  out: { opacity: 0, scale: 1.02, filter: 'blur(10px)', transition: { duration: 0.3, ease: 'easeIn' } }
};

interface CareerPathData {
  target_role?: string;
  narrative?: string;
  gap_analysis?: string[];
  recommended_actions?: string[];
}

const CareerRadar = () => {
  const { careerPath, globalLoading } = useCv();

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
          <Target className="text-accent" /> Career <span className="text-gradient">Radar</span>
        </h1>
        <p className="text-slate-400 mt-2">AI-forecasted career trajectory and milestone roadmap.</p>
      </div>

      {globalLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !careerPath ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Target className="text-slate-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-300">Radar Offline</h2>
          <p className="text-slate-500 mt-2 max-w-md">No career trajectory data available yet. Please upload your CV.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto pr-4 space-y-8 pb-12">
          
          {/* Timeline Start */}
          <div className="relative pl-8 border-l-2 border-slate-700/50 space-y-12 py-4">
            
            {/* Current State */}
            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-surface border-4 border-primary flex items-center justify-center shadow-neon z-10" />
              <GlassCard delay={0.1}>
                <div className="text-sm font-bold text-primary tracking-widest uppercase mb-1">Current State</div>
                <h3 className="text-2xl font-bold text-white mb-2">Ready to Grow</h3>
                <p className="text-slate-400">Your base skills have been mapped. Preparing trajectory...</p>
              </GlassCard>
            </div>

            {/* Gap Analysis / Missing Skills */}
            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-surface border-4 border-warning flex items-center justify-center shadow-[0_0_10px_rgba(250,204,21,0.5)] z-10">
                <AlertCircle size={12} className="text-warning" />
              </div>
              <GlassCard delay={0.2} className="border-l-4 border-l-warning">
                <div className="text-sm font-bold text-warning tracking-widest uppercase mb-4">Bridging the Gap</div>
                <div className="grid grid-cols-1 gap-3">
                  {(Array.isArray(careerPath.gap_analysis) 
                    ? careerPath.gap_analysis 
                    : typeof careerPath.gap_analysis === 'string' 
                      ? [careerPath.gap_analysis] 
                      : []
                  ).map((gap, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700"
                    >
                      <Circle size={16} className="text-slate-500" />
                      <span className="text-slate-200">{gap}</span>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Action Plan */}
            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-surface border-4 border-secondary flex items-center justify-center shadow-[0_0_10px_rgba(129,140,248,0.5)] z-10" />
              <GlassCard delay={0.4}>
                <div className="text-sm font-bold text-secondary tracking-widest uppercase mb-4">Recommended Actions</div>
                <ul className="space-y-4">
                  {careerPath.recommended_actions?.map((action, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className="flex items-start gap-3"
                    >
                      <ArrowRight size={18} className="text-secondary mt-1 flex-shrink-0" />
                      <span className="text-slate-300 leading-relaxed">{action}</span>
                    </motion.li>
                  ))}
                </ul>
              </GlassCard>
            </div>

            {/* Target Role */}
            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-success flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.8)] z-10">
                <CheckCircle2 size={16} className="text-surface" />
              </div>
              <GlassCard delay={0.6} className="border-accent shadow-neon-accent">
                <div className="text-sm font-bold text-accent tracking-widest uppercase mb-1">Target Role</div>
                <h3 className="text-3xl font-black text-white mb-3">{careerPath.target_role}</h3>
                <p className="text-slate-300 leading-relaxed italic border-l-2 border-accent/50 pl-4">{careerPath.narrative}</p>
              </GlassCard>
            </div>

          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CareerRadar;
