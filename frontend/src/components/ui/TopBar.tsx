import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, Loader2, Activity } from 'lucide-react';
import { useCv } from '../../context/CvContext';
import { motion, AnimatePresence } from 'framer-motion';

export const TopBar = () => {
  const { setCvText, setSkills, setBullets, setCareerPath, token, setToken, isProcessing, statusText } = useCv();
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setSuccess(false);
    
    // Clear previous CV extraction from frontend context to ensure a clean slate immediately
    setSkills([]);
    setBullets([]);
    setCareerPath(null);
    setCvText(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/cv', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setCvText(data.parsed_text);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const isLoading = uploading || isProcessing;

  return (
    <div className="relative z-20">
      <header className="h-20 border-b border-slate-800/50 bg-surface/50 backdrop-blur-md flex items-center justify-between px-8 relative z-20">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold tracking-wider text-slate-200">
            COMMAND<span className="text-primary font-light">CENTER</span>
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <AnimatePresence>
            {success && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-success flex items-center gap-2 text-sm font-medium"
              >
                <CheckCircle2 size={16} />
                Upload Successful
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => {
              const currentToken = token;
              setToken(null);
              setTimeout(() => setToken(currentToken), 100);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-full cursor-pointer transition-colors text-sm font-medium text-slate-300 hover:text-white"
          >
            Refresh Data
          </button>
          
          <label className="relative flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-full cursor-pointer transition-colors group">
            <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
            {isLoading ? <Loader2 size={16} className="animate-spin text-primary" /> : <UploadCloud size={16} className="text-primary group-hover:text-white transition-colors" />}
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
              {isLoading ? "Processing..." : "Live CV Sync"}
            </span>
          </label>
        </div>
      </header>

      {/* DEDICATED LIVE STATUS BAR */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 40, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute top-full left-0 right-0 bg-primary/10 border-b border-primary/20 flex items-center justify-center gap-3 overflow-hidden backdrop-blur-md z-10"
          >
            <Activity size={16} className="text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary tracking-wide">
              SYSTEM STATUS: <span className="text-slate-200">{statusText}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
