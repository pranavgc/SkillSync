import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/ui/Sidebar';
import { TopBar } from './components/ui/TopBar';
import ParticleBackground from './components/ui/ParticleBackground';
import { Canvas } from '@react-three/fiber';

import Dashboard from './screens/Dashboard';
import SkillTree from './screens/SkillTree';
import CareerRadar from './screens/CareerRadar';
import ResumeForge from './screens/ResumeForge';
import AiMentor from './screens/AiMentor';

function App() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <ParticleBackground />
        </Canvas>
      </div>

      {/* Main UI Layer */}
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-auto p-8 relative">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/skills" element={<SkillTree />} />
              <Route path="/radar" element={<CareerRadar />} />
              <Route path="/resume" element={<ResumeForge />} />
              <Route path="/mentor" element={<AiMentor />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
