import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

function StarBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 bg-white rounded-full"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            opacity: Math.random() 
          }}
          animate={{ 
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 2 + Math.random() * 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

export default function SplashScreen() {
  const navigate = useNavigate();
  const [show, setShow] = useState(() => !sessionStorage.getItem('vaikunth_splash_shown'));
  const { user, loading } = useAuth();
  const hasOnboarded = localStorage.getItem('visionai_onboarded') === 'true';

  useEffect(() => {
    // If we've already shown the splash, we should have navigated away.
    // This is a safety check for when the user is at "/"
    const splashShown = sessionStorage.getItem('vaikunth_splash_shown');
    
    if (splashShown && !loading) {
      if (!hasOnboarded) {
        navigate('/onboarding', { replace: true });
      } else if (user) {
        navigate('/home', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
      return;
    }

    if (loading || !show) return;

    const timer = setTimeout(() => {
      sessionStorage.setItem('vaikunth_splash_shown', 'true');
      setShow(false);
      // Wait for exit animation to complete before navigating
      setTimeout(() => {
        if (!hasOnboarded) {
          navigate('/onboarding', { replace: true });
        } else if (user) {
          navigate('/home', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }, 1000); // Increased to match transition.duration
    }, 4500); 
    return () => clearTimeout(timer);
  }, [navigate, loading, user, hasOnboarded, show]);

  const title = "Vaikunth AI";
  const tagline = "Create Beyond Limits";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
          className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100] overflow-hidden"
        >
          {/* Cosmic Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a2e_0%,_#000000_100%)]" />
          <StarBackground />

          <div className="relative flex flex-col items-center justify-center min-h-screen">
            {/* The Logo Container */}
            <Logo size={160} animated={true} showText={false} className="z-10" />
            
            {/* Text Elements with Typewriter Effect */}
            <div className="mt-8 text-center z-10">
              <div className="flex items-center justify-center">
                {title.split("").map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 2.3 + (index * 0.1),
                      duration: 0.1,
                      ease: "easeOut"
                    }}
                    className="text-5xl font-bold text-white tracking-tight drop-shadow-[0_0_20px_rgba(245,158,11,0.3)] inline-block min-w-[0.2em]"
                    style={{
                      textShadow: char !== " " ? "0 0 15px rgba(245,158,11,0.5)" : "none"
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  delay: 2.3 + (title.length * 0.1) + 0.5, 
                  duration: 1 
                }}
                className="mt-6 text-gray-500 text-sm font-medium tracking-[0.4em] uppercase"
              >
                {tagline}
              </motion.p>
            </div>
            
            {/* Soft Ambient Glow Behind Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 2 }}
              className="absolute w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
