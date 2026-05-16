import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';
import { Sparkles, Trophy, Users, Rocket, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const ONBOARDING_STEPS = [
  {
    title: "Dream in High Def",
    desc: "Your words transformed into cinematic masterpieces with a single tap.",
    icon: <Sparkles className="text-purple-500" size={48} />,
    gradient: "from-purple-500/20 to-transparent"
  },
  {
    title: "Image Alchemy",
    desc: "Remove backgrounds, swap faces, and enhance clarity like real magic.",
    icon: <Trophy className="text-yellow-500" size={48} />,
    gradient: "from-yellow-500/20 to-transparent"
  },
  {
    title: "Voice of Future",
    desc: "Clone voices or use our studio-grade speakers for perfect audio.",
    icon: <Users className="text-blue-500" size={48} />,
    gradient: "from-blue-500/20 to-transparent"
  }
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('visionai_onboarded', 'true');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between p-8 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-purple-600/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full" />

      <div className="self-center flex flex-col items-center gap-2">
        <Logo size={48} animated={true} />
        <p className="text-[9px] text-purple-400/60 font-bold uppercase tracking-[0.4em]">Create Beyond Limits</p>
      </div>

      <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center relative">
        <motion.div
           key={step}
           initial={{ x: 100, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           exit={{ x: -100, opacity: 0 }}
           className="text-center space-y-8"
        >
          <div className={cn("inline-flex p-8 rounded-[2rem] bg-gradient-to-br border border-white/10 backdrop-blur-2xl shadow-2xl", ONBOARDING_STEPS[step].gradient)}>
            {ONBOARDING_STEPS[step].icon}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white tracking-tight uppercase leading-none">
              {ONBOARDING_STEPS[step].title.split(' ').map((w, i) => (
                <span key={i} className={i === 1 ? "text-purple-500 block" : "block"}>{w}</span>
              ))}
            </h1>
            <p className="text-gray-400 text-lg font-light leading-relaxed">
              {ONBOARDING_STEPS[step].desc}
            </p>
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2">
          {ONBOARDING_STEPS.map((_, i) => (
            <div key={i} className={cn("h-1 w-8 rounded-full transition-all duration-500", i === step ? "bg-purple-500 w-12" : "bg-white/10")} />
          ))}
        </div>
      </div>

      <div className="w-full max-w-md mt-12 flex flex-col gap-4 relative z-10">
        <Button 
          onClick={handleNext}
          className="h-16 w-full rounded-2xl bg-purple-600 text-white text-lg font-black uppercase tracking-tighter hover:bg-purple-500 group transition-all purple-glow"
        >
          {step === ONBOARDING_STEPS.length - 1 ? 'Start Your Vision' : 'Explore Next'}
          <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={() => {
            localStorage.setItem('visionai_onboarded', 'true');
            navigate('/login');
          }}
          className="text-gray-500 hover:text-white"
        >
          Skip Introduction
        </Button>
      </div>
    </div>
  );
}
