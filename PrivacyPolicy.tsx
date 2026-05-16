import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function PrivacyPolicy() {
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
            <div className="p-3 bg-purple-500/10 rounded-2xl">
              <Shield className="text-purple-500" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-widest">Privacy Policy</h1>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Last Updated: May 2024</p>
            </div>
          </div>

          <div className="space-y-8 text-gray-400 leading-relaxed font-medium">
            <section className="space-y-4">
              <h2 className="text-white text-lg font-bold uppercase tracking-wider">1. Data Neural Synchronization</h2>
              <p>
                Vaikunth AI protocols ensure that all generative data processing is conducted within secure, 
                encrypted neural environments. We collect only the metadata required to facilitate 
                high-fidelity content generation.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-white text-lg font-bold uppercase tracking-wider">2. Cognitive Preservation</h2>
              <p>
                Your creations (Vision Blocks) are stored with 256-bit encryption. We do not sell your 
                creative output. All content generated via our AI models remains under your cognitive 
                jurisdiction, subject to our content safety guidelines.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-white text-lg font-bold uppercase tracking-wider">3. Analytical Tracking</h2>
              <p>
                We utilize telemetry to optimize system performance. This includes generation times, 
                error rates, and feature interaction metrics. Identity-linked data is never exposed to 
                third-party neural networks.
              </p>
            </section>

            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
              <p className="text-xs italic text-gray-500">
                Vaikunth AI is committed to the ethical deployment of generative intelligence. By using our neural 
                services, you consent to our data safety protocols.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
