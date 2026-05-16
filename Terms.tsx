import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 mb-20 lg:mb-0">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-white/5"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <FileText className="text-blue-500" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-widest">Terms of Service</h1>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Last Updated: May 2024</p>
            </div>
          </div>

          <div className="space-y-8 text-gray-400 leading-relaxed font-medium">
            <section className="space-y-4">
              <h2 className="text-white text-lg font-bold uppercase tracking-wider">1. Neural Access License</h2>
              <p>
                Vaikunth AI grants you a revocable, non-exclusive license to utilize our generative models. 
                Abuse of system resources (e.g., prompt injection, scraping) will result in immediate 
                neural link termination.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-white text-lg font-bold uppercase tracking-wider">2. Creative Ownership</h2>
              <p>
                You retain all rights to the media objects generated through our platform. However, 
                you grant Vaikunth AI a limited license to host and process this content for system 
                operational requirements.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-white text-lg font-bold uppercase tracking-wider">3. Subscription Protocols</h2>
              <p>
                Credits are strictly non-transferable. Unused generation capacity for the "Creator" 
                and "Studio" tiers resets at the end of every billing cycle unless otherwise 
                specified in your neural contract.
              </p>
            </section>

            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl">
              <p className="text-[10px] uppercase tracking-widest text-red-400 font-black">
                Violation of ethical AI generation standards will result in permanent biometric blacklist.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
