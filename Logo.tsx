import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function Logo({ className, size = 48, animated = false, showText = false }: { className?: string, size?: number, animated?: boolean, showText?: boolean }) {
  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center group pointer-events-none", className)}>
      <div className="relative flex items-center justify-center">
        {/* Divine Light Rays (Brief Shine) */}
        {animated && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-[120%] bg-gradient-to-b from-transparent via-amber-400/30 to-transparent"
            initial={{ opacity: 0, rotate: i * 60 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              scaleY: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              delay: 1.5, 
              duration: 1, 
              ease: "easeOut" 
            }}
          />
        ))}

        <motion.svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10"
        >
          <defs>
            <linearGradient id="hexagon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" /> {/* Purple */}
              <stop offset="50%" stopColor="#F59E0B" /> {/* Gold */}
              <stop offset="100%" stopColor="#9333EA" /> {/* Deep Purple */}
            </linearGradient>

            <linearGradient id="v-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            <filter id="v-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="border-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Hexagon Border with Subtle Glow Idle */}
          <motion.path
            d="M50 5 L90 28 L90 72 L50 95 L10 72 L10 28 Z"
            stroke="url(#hexagon-gradient)"
            strokeWidth="3.5"
            fill="rgba(0,0,0,0.6)"
            filter="url(#border-glow)"
            animate={animated ? {
              opacity: [0.6, 1, 0.6],
              strokeWidth: [3.5, 4.5, 3.5],
            } : {}}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />

          {/* Stylized Bold 'V' */}
          <motion.path
            d="M30 35 L50 75 L70 35"
            stroke="url(#v-gold)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#v-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
          />
        </motion.svg>
      </div>

      {showText && (
        <div className="mt-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="text-4xl font-bold text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          >
            Vaikunth AI
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 1 }}
            className="mt-2 text-sm text-gray-400 font-medium tracking-[0.2em]"
          >
            Create Beyond Limits
          </motion.p>
        </div>
      )}
    </div>
  );
}
