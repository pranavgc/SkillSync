import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { Target, Lightbulb, Network } from 'lucide-react';

import { useCv } from '../context/CvContext';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, filter: 'blur(10px)' },
  in: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.4, ease: 'easeOut' } },
  out: { opacity: 0, scale: 1.02, filter: 'blur(10px)', transition: { duration: 0.3, ease: 'easeIn' } }
};

const Dashboard = () => {
  const { careerPath, skills } = useCv();
  
  const targetRole = careerPath?.target_role || "Awaiting Data";
  const insights = careerPath?.recommended_actions || [];

  return (
    <motion.div 
      variants={pageVariants} 
      initial="initial" 
      animate="in" 
      exit="out"
      className="max-w-6xl mx-auto h-full flex flex-col gap-6"
    >
      <div className="flex items-end justify-between mb-2">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black tracking-tight text-white mb-1"
          >
            AI Career <span className="text-gradient">Command Center</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 font-medium"
          >
            Your live skill trajectory and market positioning.
          </motion.p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard delay={0.1} className="flex items-center gap-4 group">
          <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all">
            <Target size={28} />
          </div>
          <div>
            <div className="text-slate-400 text-sm font-medium">Target Role</div>
            <div className="text-xl font-bold text-white">{targetRole}</div>
          </div>
        </GlassCard>

        <GlassCard delay={0.2} className="flex items-center gap-4 group">
          <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20 text-accent group-hover:scale-110 group-hover:bg-accent/20 transition-all">
            <Network size={28} />
          </div>
          <div>
            <div className="text-slate-400 text-sm font-medium">Total Skill Nodes Extracted</div>
            <div className="text-xl font-bold text-white">{skills.length}</div>
          </div>
        </GlassCard>
      </div>

      <div className="flex-1 min-h-0">
        <GlassCard delay={0.3} className="h-full flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Lightbulb className="text-warning" size={18} /> Recommended Strategic Actions
          </h3>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
            {insights.length > 0 ? (
              insights.map((insight, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="text-sm text-slate-300 leading-relaxed">{insight}</div>
                </motion.div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <Lightbulb size={32} className="mb-2 opacity-50" />
                <p>Upload a CV to generate AI-driven career recommendations.</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default Dashboard;
