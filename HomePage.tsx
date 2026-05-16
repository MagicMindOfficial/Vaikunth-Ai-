import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Layout } from '../components/Layout';
import { 
  Play, 
  Image as ImageIcon, 
  Music as MusicIcon, 
  Sparkles, 
  History, 
  ChevronRight,
  TrendingUp,
  Users,
  Zap,
  Star,
  Bot
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress, ProgressTrack, ProgressIndicator } from '../components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '../components/ui/dialog';
import { X, PlayCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const MASTERPIECES = [
  {
    id: 'm1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1280&h=720&fit=crop',
    title: 'Featured Creation • Image',
    desc: 'Cinematic Cyberpunk Cityscape',
    prompt: 'A futuristic city at night with neon lights and rain-soaked streets, photorealistic, 8k'
  },
  {
    id: 'm2',
    type: 'video',
    url: 'https://cdn.pixabay.com/vimeo/327334609/milky-way-23658.mp4?width=1280&hash=8b5b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
    title: 'Featured Creation • Video',
    desc: 'Neural Space Exploration',
    prompt: 'Cinematic flight through a colorful nebula in deep space, high resolution'
  }
];

export default function HomePage() {
  const { profile, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  const firstName = profile?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Visionary';

  return (
    <Layout>
      <div className="p-6 space-y-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-950 via-black to-black border border-white/5 p-8 shadow-2xl">
           <div className="absolute top-0 right-0 p-8 opacity-20">
              <Sparkles size={120} className="text-purple-500 animate-pulse" />
           </div>
           <div className="relative z-10 space-y-6">
              <h2 className="text-3xl font-black text-white leading-[1.1] uppercase tracking-tighter">
                Transform Reality<br />
                <span className="gold-text">With AI Magic</span>
              </h2>
              <p className="text-gray-400 text-sm font-light max-w-[240px]">
                Create Beyond Limits
              </p>
              <Button 
                onClick={() => navigate('/image-tools')}
                className="h-12 px-8 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold purple-glow transition-all"
              >
                START CREATING
              </Button>
           </div>
        </section>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4">
           <Card className="bg-white/5 border-white/5 p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Total Users</p>
                <p className="text-lg font-bold text-white">45.2K+</p>
              </div>
           </Card>
           <Card className="bg-white/5 border-white/5 p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Creations</p>
                <p className="text-lg font-bold text-white">1.2M+</p>
              </div>
           </Card>
        </div>

        {/* Feature Tools Grid */}
        <section className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Core Engine</h3>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <ToolCard 
                onClick={() => navigate('/image-tools')}
                title="Image Studio"
                desc="Alchemy & Art"
                icon={<ImageIcon className="text-blue-500" />}
                color="blue"
              />
              <ToolCard 
                onClick={() => navigate('/audio-tools')}
                title="Voice Studio"
                desc="Clones & TTS"
                icon={<MusicIcon className="text-green-500" />}
                color="green"
              />
              <ToolCard 
                onClick={() => navigate('/assistant')}
                title="Chat Assistant"
                desc="Smart Companion"
                icon={<Bot className="text-purple-500" />}
                color="purple"
              />
           </div>
        </section>

        {/* Masterpieces Section */}
        <section className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Our Masterpieces</h3>
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
           </div>
           
           <div className="space-y-6">
             {MASTERPIECES.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className="relative group rounded-3xl overflow-hidden aspect-video border border-white/10 cursor-pointer transition-all active:scale-[0.98]"
                >
                    <img 
                      src={item.type === 'video' ? `https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1280&h=720&fit=crop` : item.url} 
                      alt={item.desc} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                          <PlayCircle className="text-white fill-white" size={32} />
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-6 left-6">
                      <p className="text-[10px] text-white/70 font-black uppercase tracking-[0.2em] mb-1">{item.title}</p>
                      <p className="text-sm text-white font-bold tracking-tight uppercase">{item.desc}</p>
                    </div>
                </div>
             ))}
           </div>
        </section>

        {/* Media Modal */}
        <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
          <DialogContent className="max-w-4xl bg-black/95 border-white/10 p-0 overflow-hidden rounded-[2rem] shadow-2xl backdrop-blur-2xl">
            {selectedMedia && (
              <div className="flex flex-col">
                <div className="p-6 border-b border-white/5">
                  <h2 className="text-xl font-black uppercase tracking-tighter text-white">{selectedMedia.desc}</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Vaikunth AI Masterpiece</p>
                </div>

                <div className="p-4 md:p-8 space-y-6">
                  <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    {selectedMedia.type === 'image' ? (
                      <img 
                        src={selectedMedia.url} 
                        className="w-full h-full object-contain" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <video 
                        src={selectedMedia.url} 
                        className="w-full h-full" 
                        controls 
                        autoPlay 
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Neural Blueprint</p>
                    <p className="text-xs text-white/80 leading-relaxed font-medium bg-white/5 p-4 rounded-2xl border border-white/5">
                      {selectedMedia.prompt}
                    </p>
                  </div>

                  <Button 
                    onClick={() => setSelectedMedia(null)}
                    className="w-full h-12 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/90"
                  >
                    Close Vision
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Plan Usage (Quick view) */}
        <section className="p-1 border-white/5 rounded-3xl">
           <Card className="bg-white/5 border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Zap size={16} className="text-yellow-500" />
                   <span className="text-sm font-bold uppercase tracking-wide">Current Plan</span>
                </div>
                <span className="text-[10px] bg-purple-500 px-3 py-1 rounded-full text-white font-black uppercase">{isAdmin ? 'Admin' : (profile?.plan || 'Starter')}</span>
              </div>
              <Progress value={isAdmin ? 0 : ((profile?.creationsCount || 0) / (profile?.plan === 'Starter' ? 3 : 30)) * 100} className="h-6" />
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase">
                <span>{profile?.creationsCount || 0} CREATIONS USED</span>
                <span>{isAdmin || profile?.plan === 'Studio' ? 'UNLIMITED' : (profile?.plan === 'Starter' ? '3' : '30')} LIMIT</span>
              </div>
           </Card>
        </section>

        <div className="h-24" /> {/* Spacer */}
      </div>
    </Layout>
  );
}

function ToolCard({ title, desc, icon, color, onClick }: any) {
  const colorStyles: any = {
    blue: "from-blue-500/10 to-transparent border-blue-500/20",
    red: "from-red-500/10 to-transparent border-red-500/20",
    green: "from-green-500/10 to-transparent border-green-500/20",
    purple: "from-purple-500/10 to-transparent border-purple-500/20",
  };

  return (
    <Card 
      onClick={onClick}
      className={cn(
        "bg-gradient-to-br border p-5 space-y-4 cursor-pointer hover:scale-95 transition-all group active:scale-90",
        colorStyles[color]
      )}
    >
      <div className="p-3 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-black text-white uppercase tracking-tight">{title}</h4>
        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{desc}</p>
      </div>
      <ChevronRight size={14} className="text-gray-700 self-end" />
    </Card>
  );
}
