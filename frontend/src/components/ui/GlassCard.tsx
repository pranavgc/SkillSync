import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const GlassCard = ({ children, className, delay = 0 }: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn("glass-panel p-6 relative overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-glass-gradient pointer-events-none opacity-20" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
