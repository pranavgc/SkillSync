import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Network, Target, FileText, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/skills', label: 'Skill Matrix', icon: Network },
  { path: '/radar', label: 'Career Radar', icon: Target },
  { path: '/resume', label: 'Resume Forge', icon: FileText },
  { path: '/mentor', label: 'AI Mentor', icon: MessageSquare },
];

export const Sidebar = () => {
  return (
    <nav className="w-64 border-r border-slate-800/50 bg-surface/30 backdrop-blur-md flex flex-col h-full z-20 relative">
      <div className="p-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-neon mb-2">
          <Network className="text-white" size={24} />
        </div>
        <h1 className="text-2xl font-bold tracking-tighter text-white mt-4">
          Skill<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Sync</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium tracking-widest mt-1 uppercase">OS v2.0.4</p>
      </div>

      <div className="flex-1 flex flex-col gap-2 px-4 mt-8">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-slate-800/80 border border-slate-700 rounded-xl -z-10"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-neon" />
                )}
                <Icon size={20} className={isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
                <span className="font-medium text-sm tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      
      <div className="p-8 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600"></div>
          <div>
            <div className="text-sm font-medium text-slate-200">Test User</div>
            <div className="text-xs text-success flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(74,222,128,0.8)]" /> Online
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
