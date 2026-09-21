import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef } from 'react';

interface SkillNode {
  skill_node: string;
  parent_category: string;
  relationship_level: string;
}

interface CareerPathData {
  target_role?: string;
  narrative?: string;
  gap_analysis?: string[];
  recommended_actions?: string[];
}

interface CvContextType {
  cvText: string | null;
  setCvText: (text: string | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  skills: SkillNode[];
  setSkills: (skills: SkillNode[]) => void;
  bullets: string[];
  setBullets: (bullets: string[]) => void;
  careerPath: CareerPathData | null;
  setCareerPath: (path: CareerPathData | null) => void;
  globalLoading: boolean;
  isProcessing: boolean;
  statusText: string;
}

const CvContext = createContext<CvContextType | undefined>(undefined);

export const CvProvider = ({ children }: { children: ReactNode }) => {
  const [cvText, setCvText] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const [skills, setSkills] = useState<SkillNode[]>([]);
  const [bullets, setBullets] = useState<string[]>([]);
  const [careerPath, setCareerPath] = useState<CareerPathData | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("Idle");

  const fetchAllData = useCallback(async () => {
    setGlobalLoading(true);
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      // Fetch Skills
      const skillsRes = await fetch('/api/skill-tree', { headers });
      if (skillsRes.ok) {
        const data = await skillsRes.json();
        if (data.skills) setSkills(data.skills);
      }

      // Fetch Bullets
      const bulletsRes = await fetch('/api/resume-bullets', { headers });
      if (bulletsRes.ok) {
        const data = await bulletsRes.json();
        if (data.bullets) setBullets(data.bullets);
      }

      // Fetch Career Path
      const pathRes = await fetch('/api/career-path', { headers });
      if (pathRes.ok) {
        const data = await pathRes.json();
        if (data.career_path) setCareerPath(data.career_path);
      }
    } catch (e) {
      console.error("Error fetching global state:", e);
    } finally {
      setGlobalLoading(false);
    }
  }, [token]);

  const lastStepRef = useRef(0);

  // Initial fetch and polling loop
  useEffect(() => {
    fetchAllData();
    
    const interval = setInterval(async () => {
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch('/api/processing-status', { headers });
        if (res.ok) {
          const data = await res.json();
          setIsProcessing(data.is_processing);
          setStatusText(data.status);
          
          // Progressive refresh: Update UI immediately when Agent 1 finishes (Step 2+)
          if (data.step > lastStepRef.current && data.step > 1) {
            fetchAllData();
          }
          lastStepRef.current = data.step;
        }
      } catch (e) {
        console.error("Error polling processing status", e);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [token, fetchAllData]);

  return (
    <CvContext.Provider value={{ 
      cvText, setCvText, token, setToken, 
      skills, setSkills, bullets, setBullets, 
      careerPath, setCareerPath, globalLoading,
      isProcessing, statusText
    }}>
      {children}
    </CvContext.Provider>
  );
};

export const useCv = () => {
  const context = useContext(CvContext);
  if (!context) {
    throw new Error('useCv must be used within a CvProvider');
  }
  return context;
};
