import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { Network, Zap } from 'lucide-react';
import { useCv } from '../context/CvContext';

interface SkillNode {
  skill_node: string;
  parent_category: string;
  relationship_level: string;
}

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, filter: 'blur(10px)' },
  in: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.4, ease: 'easeOut' } },
  out: { opacity: 0, scale: 1.02, filter: 'blur(10px)', transition: { duration: 0.3, ease: 'easeIn' } }
};

const SkillTree = () => {
  const { skills, globalLoading, cvText } = useCv();

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.parent_category]) acc[skill.parent_category] = [];
    acc[skill.parent_category].push(skill);
    return acc;
  }, {} as Record<string, SkillNode[]>);

  return (
    <motion.div 
      variants={pageVariants} 
      initial="initial" 
      animate="in" 
      exit="out"
      className="max-w-6xl mx-auto h-full flex flex-col"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Network className="text-primary" /> Interactive <span className="text-gradient">Skill Matrix</span>
        </h1>
        <p className="text-slate-400 mt-2">Your neural network of capabilities, extracted directly from your workflow.</p>
      </div>

      {globalLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : skills.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Network className="text-slate-600 mb-4" size={48} />
          {cvText ? (
            <>
              <h2 className="text-xl font-bold text-slate-300">No Skills Extracted</h2>
              <p className="text-slate-500 mt-2 max-w-md">Your CV was processed, but the AI could not confidently identify any specific skills or assets. Try uploading a more detailed resume.</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-300">Awaiting Data Uplink</h2>
              <p className="text-slate-500 mt-2 max-w-md">Upload your CV to generate your interactive skill matrix.</p>
            </>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-auto pr-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            {/* SVG Lines could go here using absolute positioning and refs, but for UI elegance we rely on the 3D BG + structured layout */}
            
            {Object.entries(groupedSkills).map(([category, nodes], catIndex) => (
              <GlassCard key={category} delay={catIndex * 0.1} className="flex flex-col relative z-10 border-t-2 border-t-primary/50">
                <div className="text-sm font-black tracking-widest text-slate-500 uppercase mb-4">{category}</div>
                <div className="flex flex-col gap-3">
                  {nodes.map((node, i) => (
                    <motion.div
                      key={node.skill_node}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (catIndex * 0.1) + (i * 0.1) + 0.2 }}
                      className="group relative p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:bg-slate-700/80 hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex justify-between items-center z-10">
                        <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">{node.skill_node}</span>
                        <div className="flex items-center gap-1">
                          <Zap size={12} className={node.relationship_level === 'Expert' ? 'text-accent' : 'text-primary'} />
                          <span className="text-xs font-mono text-slate-400">{node.relationship_level}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SkillTree;
