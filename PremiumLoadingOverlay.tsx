import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { Logo } from './Logo';

interface PremiumLoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
}

export function PremiumLoadingOverlay({ isVisible, message = "Summoning Vision...", progress }: PremiumLoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
          <div className="relative flex flex-col items-center gap-8 p-12">
            {/* Animated Glow */}
            <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full animate-pulse" />
            
            <div className="relative flex items-center justify-center">
              {/* cinematic volumetric ring */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                className="absolute w-64 h-64 border border-purple-500/10 rounded-full"
              />
              
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute w-32 h-32 bg-purple-600/10 rounded-full blur-2xl"
              />

              {/* Official V Logo with Build Sequence */}
              <div className="relative z-10 w-32 h-32">
                <Logo size={128} animated={isVisible} />
              </div>
              
              {progress !== undefined && (
                <div className="absolute -bottom-12 text-purple-400 font-black text-[10px] tracking-[0.3em]">
                   {Math.round(progress)}% COMPLETE
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 text-center relative z-10">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white text-sm font-black uppercase tracking-[0.5em] ml-1"
              >
                {message}
              </motion.p>
              <div className="h-[2px] w-48 bg-white/5 overflow-hidden rounded-full relative">
                {progress !== undefined ? (
                   <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                   />
                ) : (
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="h-full w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                  />
                )}
              </div>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-2">Neural processing in progress</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
