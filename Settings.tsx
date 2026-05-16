import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { 
  User, 
  ShieldCheck, 
  Globe, 
  CreditCard, 
  Database, 
  LifeBuoy, 
  Info, 
  LogOut, 
  ChevronRight,
  Bell,
  Sliders,
  Smartphone,
  Trash2,
  Camera,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Mail,
  History,
  Lock,
  Send,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';
import emailjs from '@emailjs/browser';

export default function Settings() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  // States for Preferences
  const [quality, setQuality] = useState(profile?.preferences?.quality || '1080p');
  const [style, setStyle] = useState(profile?.preferences?.style || 'Cinematic');
  const [notifications, setNotifications] = useState(profile?.preferences?.notifications ?? true);
  const [alerts, setAlerts] = useState(profile?.preferences?.alerts ?? true);
  const [biometric, setBiometric] = useState(profile?.biometricEnabled ?? false);
  const [language, setLanguage] = useState(profile?.language || 'English');
  
  // Support Form States
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [isSendingSupport, setIsSendingSupport] = useState(false);
  const [supportStatus, setSupportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (profile?.preferences) {
      setQuality(profile.preferences.quality || '1080p');
      setStyle(profile.preferences.style || 'Cinematic');
      setNotifications(profile.preferences.notifications ?? true);
      setAlerts(profile.preferences.alerts ?? true);
    }
    if (profile) {
      setBiometric(profile.biometricEnabled ?? false);
      setLanguage(profile.language || 'English');
    }
  }, [profile]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const saveSettings = async (updates: any) => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), updates);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePreferenceSave = async () => {
    await saveSettings({
      preferences: {
        quality,
        style,
        notifications,
        alerts
      },
      biometricEnabled: biometric,
      language
    });
    setActiveSection(null);
  };

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject || !supportMessage) return;
    
    setIsSendingSupport(true);
    setSupportStatus(null);

    const messageData = {
      userId: user?.uid || 'anonymous',
      email: user?.email || 'anonymous',
      subject: supportSubject,
      message: supportMessage,
      createdAt: new Date().toISOString(),
      status: 'unread'
    };

    try {
      // 1. Save to Firestore (Primary)
      try {
        await addDoc(collection(db, 'support_messages'), messageData);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'support_messages');
        throw err;
      }

      // 2. EmailJS (Secondary - if configured)
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        try {
          await emailjs.send(
            serviceId,
            templateId,
            {
              from_name: profile?.displayName || user?.email || 'Vaikunth AI User',
              from_email: user?.email,
              subject: supportSubject,
              message: supportMessage,
              to_email: import.meta.env.VITE_SUPPORT_EMAIL
            },
            publicKey
          );
        } catch (emailErr) {
          console.warn('EmailJS delivery failed, but Firestore saved the message:', emailErr);
        }
      }

      setSupportStatus({ type: 'success', message: 'Transmission successful. Our team will review the log in the admin console.' });
      setSupportSubject('');
      setSupportMessage('');
    } catch (err) {
      console.error('Support sending error:', err);
      setSupportStatus({ type: 'error', message: 'Transmission failed. Re-attempt when stable.' });
    } finally {
      setIsSendingSupport(false);
    }
  };

  const PLANS = [
    { 
      id: 'Starter', 
      name: 'Free Plan', 
      price: '₹0', 
      features: ['3 Image gens/3 weeks', '3 Video gens/3 weeks', '3 Audio gens/3 weeks', 'Standard priority'],
      color: 'gray'
    },
    { 
      id: 'Creator', 
      name: 'Creator Plan', 
      price: '₹99/mo', 
      features: ['20 Image gens/mo', '20 Video gens/mo', 'No watermark', 'Faster generations'],
      color: 'purple' 
    },
    { 
      id: 'Studio', 
      name: 'Studio Plan', 
      price: '₹199/mo', 
      features: ['Unlimited Image gens', 'Unlimited Video gens', 'Premium AI tools', 'Highest priority'],
      color: 'indigo'
    }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'preferences':
        return (
          <div className="space-y-6 p-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Default Video Quality</Label>
                <select 
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl h-12 px-4 text-xs font-bold text-white outline-none focus:border-purple-500"
                >
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  <option value="4K">4K Ultra</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Default Visual Style</Label>
                <select 
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl h-12 px-4 text-xs font-bold text-white outline-none focus:border-purple-500"
                >
                  <option value="Cinematic">Cinematic</option>
                  <option value="Realistic">Realistic</option>
                  <option value="Anime">Anime</option>
                  <option value="3D Animation">3D Animation</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white uppercase tracking-tight">Push Notifications</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest">Alerts for generations</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white uppercase tracking-tight">System Alerts</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest">Plan & security updates</p>
                </div>
                <Switch checked={alerts} onCheckedChange={setAlerts} />
              </div>
            </div>
            <Button onClick={handlePreferenceSave} className="w-full h-14 bg-purple-600 hover:bg-purple-500 font-black text-xs uppercase tracking-widest rounded-2xl">
              Save Preferences
            </Button>
          </div>
        );
      case 'billing':
        return (
          <div className="space-y-6 p-2">
             <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/20 p-6 rounded-[2rem] space-y-4">
                <header className="flex justify-between items-center">
                   <div>
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Current Active Plan</p>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight">{profile?.plan || 'Starter'}</h4>
                   </div>
                   <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                      <CreditCard size={24} />
                   </div>
                </header>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-gray-500">Generations Used</span>
                      <span className="text-white">{(profile as any)?.usage?.total || 0} / 9</span>
                   </div>
                   <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 w-[33%]" />
                   </div>
                </div>
                <p className="text-[9px] text-gray-500 uppercase font-medium tracking-widest">Auto-resets every 3 weeks</p>
             </div>
             
             <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Upgrade Identity</h4>
                <div className="space-y-3">
                   {PLANS.map(plan => (
                      <Card key={plan.id} className={cn(
                        "bg-white/5 border-white/5 p-5 flex items-center justify-between hover:bg-white/10 transition-all rounded-[1.5rem] group",
                        profile?.plan === plan.id && "border-purple-500/50 bg-purple-500/5"
                      )}>
                         <div className="flex items-center gap-4">
                            <div className={cn(
                              "p-3 rounded-xl bg-black border border-white/10 transition-transform group-hover:scale-110",
                              profile?.plan === plan.id ? "text-purple-400" : "text-gray-500"
                            )}>
                               <CheckCircle2 size={18} />
                            </div>
                            <div>
                               <p className="text-xs font-black text-white uppercase tracking-tight">{plan.name}</p>
                               <p className="text-[10px] text-gray-500 font-bold uppercase">{plan.price}</p>
                            </div>
                         </div>
                         {profile?.plan === plan.id ? (
                           <div className="text-[8px] font-black text-purple-500 uppercase tracking-widest">Current</div>
                         ) : (
                           <Button variant="outline" className="h-9 px-4 rounded-full border-purple-500/30 text-purple-400 text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white">
                              Upgrade
                           </Button>
                         )}
                      </Card>
                   ))}
                </div>
             </div>

             <div className="space-y-4 pt-4">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Payment Nexus</h4>
                <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <History size={16} className="text-gray-500" />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">View Billing History</span>
                   </div>
                   <ChevronRight size={16} className="text-gray-800" />
                </div>
             </div>
          </div>
        );
      case 'support':
        return (
          <div className="space-y-6 p-2">
             <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/5 border-white/5 p-6 flex flex-col items-center justify-center gap-3 rounded-[2rem] hover:bg-green-500/10 hover:border-green-500/20 transition-all group">
                   <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                      <Mail size={20} />
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Email Support</p>
                      <p className="text-[8px] text-gray-500 uppercase font-medium mt-1">{import.meta.env.VITE_SUPPORT_EMAIL}</p>
                   </div>
                </Card>
                <Card className="bg-white/5 border-white/5 p-6 flex flex-col items-center justify-center gap-3 rounded-[2rem] hover:bg-blue-500/10 hover:border-blue-500/20 transition-all group">
                   <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <HelpCircle size={20} />
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">FAQ Center</p>
                      <p className="text-[8px] text-gray-500 uppercase font-medium mt-1">Instant Answers</p>
                   </div>
                </Card>
             </div>

             <form className="space-y-4 bg-white/5 p-6 rounded-[2rem] border border-white/5" onSubmit={handleSendSupport}>
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-2">Transmission Log (Report Bug)</h4>
                <div className="space-y-3">
                   <input 
                     className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs text-white outline-none focus:border-purple-500" 
                     placeholder="Subject" 
                     value={supportSubject}
                     onChange={(e) => setSupportSubject(e.target.value)}
                     disabled={isSendingSupport}
                     required
                   />
                   <textarea 
                     className="w-full h-24 bg-black border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-purple-500 resize-none" 
                     placeholder="Describe the anomaly..."
                     value={supportMessage}
                     onChange={(e) => setSupportMessage(e.target.value)}
                     disabled={isSendingSupport}
                     required
                   />
                </div>
                
                <AnimatePresence>
                  {supportStatus && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2",
                        supportStatus.type === 'success' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}
                    >
                      {supportStatus.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      {supportStatus.message}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button 
                  disabled={isSendingSupport || !supportSubject || !supportMessage}
                  className="w-full h-12 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl disabled:opacity-50"
                >
                  {isSendingSupport ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send size={16} />
                      Send Report
                    </div>
                  )}
                </Button>
             </form>

             <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Knowledge Pulse</h4>
                <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Sliders size={16} className="text-gray-500" />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">System FAQ</span>
                   </div>
                   <ChevronRight size={16} className="text-gray-800" />
                </div>
             </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6 p-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white uppercase tracking-tight">Biometric Login</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest">Quick access link</p>
                </div>
                <Switch checked={biometric} onCheckedChange={setBiometric} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">System Language</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={language === 'English' ? 'default' : 'outline'}
                    onClick={() => setLanguage('English')}
                    className={cn("h-12 border-white/10 text-[10px] font-black uppercase", language === 'English' ? "bg-white text-black" : "bg-black text-white hover:bg-white/5")}
                  >English</Button>
                  <Button 
                    variant={language === 'Hindi' ? 'default' : 'outline'}
                    onClick={() => setLanguage('Hindi')}
                    className={cn("h-12 border-white/10 text-[10px] font-black uppercase", language === 'Hindi' ? "bg-white text-black" : "bg-black text-white hover:bg-white/5")}
                  >Hindi</Button>
                </div>
              </div>
            </div>
            <Button onClick={handlePreferenceSave} className="w-full h-14 bg-blue-600 hover:bg-blue-500 font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              Save Security Rules
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="p-6 pb-32 space-y-10 max-w-2xl mx-auto">
        <header className="flex flex-col items-center py-6 space-y-4">
           <div className="relative">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-purple-600 to-indigo-600 p-1 shadow-[0_0_40px_rgba(124,58,237,0.3)]">
                 <div className="w-full h-full rounded-[1.8rem] bg-black flex items-center justify-center overflow-hidden">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-purple-500" />
                    )}
                 </div>
              </div>
              <button 
                onClick={() => navigate('/profile')}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg border-4 border-black hover:scale-110 transition-transform"
              >
                <Camera size={16} />
              </button>
           </div>
           <div className="text-center">
              <h1 className="text-2xl font-bold text-white tracking-tight uppercase">{profile?.displayName || 'Visionary'}</h1>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">{profile?.email}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                 <CheckCircle2 size={12} /> {profile?.plan || 'Starter'} Member
              </div>
           </div>
        </header>

        <section className="space-y-4">
           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-4">Core Management</h3>
           <div className="space-y-3">
              <SettingsItem 
                onClick={() => setActiveSection('security')}
                icon={<ShieldCheck className="text-blue-500" />} 
                label="Security & Privacy" 
                value={biometric ? "Biometric Enabled" : "Protected Mode"}
              />
              <SettingsItem 
                onClick={() => navigate('/profile')}
                icon={<User className="text-indigo-500" />} 
                label="Identity Profile" 
                value="Update name & avatar"
              />
              <SettingsItem 
                onClick={() => setActiveSection('security')}
                icon={<Globe className="text-green-500" />} 
                label="Language" 
                value={language} 
              />
           </div>
        </section>

        <section className="space-y-4">
           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-4">Global Preferences</h3>
           <div className="space-y-3">
              <SettingsItem 
                onClick={() => setActiveSection('preferences')}
                icon={<Sliders className="text-yellow-500" />} 
                label="Toolkit Defaults" 
                value={`${quality}, ${style}`} 
              />
              <SettingsItem 
                onClick={() => setActiveSection('preferences')}
                icon={<Bell className="text-red-500" />} 
                label="Alert Channels" 
                value={notifications ? "All Alerts On" : "Silent Mode"} 
              />
           </div>
        </section>

        <section className="space-y-4">
           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-4">Billing & Ledger</h3>
           <div className="space-y-3">
              <SettingsItem 
                onClick={() => setActiveSection('billing')}
                icon={<CreditCard className="text-orange-500" />} 
                label="Account Plan" 
                value={`${profile?.plan || 'Starter'} Membership`}
                action={<span className="text-[10px] text-purple-400 font-black uppercase tracking-widest px-3 py-1 bg-purple-500/10 rounded-full">Upgrade</span>}
              />
              <SettingsItem 
                onClick={() => setActiveSection('billing')}
                icon={<Database className="text-indigo-400" />} 
                label="Data Retention" 
                value="Storage & Generations" 
              />
           </div>
        </section>

        <section className="space-y-4">
           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-4">Knowledge Base</h3>
           <div className="space-y-3">
              <SettingsItem 
                onClick={() => setActiveSection('support')}
                icon={<LifeBuoy className="text-teal-400" />} 
                label="Neural Help Desk" 
                value="FAQ & Bug Reports"
              />
              <SettingsItem 
                icon={<Logo size={24} />} 
                label="About Vaikunth AI" 
                value="v2.0.4 - Identity v2" 
                desc="Create Beyond Limits"
              />
              <div className="grid grid-cols-2 gap-3 pt-2">
                 <Link to="/privacy-policy" className="h-12 bg-white/5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all border border-transparent hover:border-white/10">
                    <FileText size={14} /> Privacy
                 </Link>
                 <Link to="/terms" className="h-12 bg-white/5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all border border-transparent hover:border-white/10">
                    <CheckCircle2 size={14} /> Terms
                 </Link>
              </div>
           </div>
        </section>

        <div className="space-y-6 pt-6">
           <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="w-full h-16 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-[2rem] gap-4 group border border-red-500/10"
           >
             <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> 
             <span className="font-black uppercase tracking-[0.2em] text-[10px]">Terminate Session</span>
           </Button>

           <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.5em] flex items-center gap-3">
                 Made with <span className="text-red-500">love</span> by Vaikunth AI Team
              </p>
           </div>
        </div>

        {/* Modal Overlay for Active Section */}
        <AnimatePresence>
          {activeSection && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setActiveSection(null)}
                 className="absolute inset-0 bg-black/80 backdrop-blur-md"
               />
               <motion.div 
                 initial={{ y: "100%" }}
                 animate={{ y: 0 }}
                 exit={{ y: "100%" }}
                 className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] relative z-10 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
               >
                  <div className="p-8 space-y-6">
                     <header className="flex justify-between items-center pb-2 border-b border-white/5">
                        <h2 className="text-xl font-black uppercase tracking-tight text-white">{activeSection}</h2>
                        <Button variant="ghost" onClick={() => setActiveSection(null)} className="text-gray-500 hover:text-white rounded-full">Close</Button>
                     </header>
                     <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {renderSectionContent()}
                     </div>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

function SettingsItem({ icon, label, value, action, desc, onClick }: { icon: React.ReactNode; label: string; value?: string; action?: React.ReactNode; desc?: string; onClick?: () => void }) {
  return (
    <Card 
      onClick={onClick}
      className="bg-white/5 border-white/5 p-4 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer group rounded-2xl active:scale-[0.98] border border-transparent hover:border-white/5 shadow-sm"
    >
       <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-black border border-white/10 group-hover:scale-110 transition-transform">
             {icon}
          </div>
          <div>
            <p className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-purple-400 transition-colors">{label}</p>
            {value && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{value}</p>}
            {desc && <p className="text-[8px] text-gray-500 font-medium uppercase tracking-[0.2em] mt-1">{desc}</p>}
          </div>
       </div>
       {action ? action : <ChevronRight size={18} className="text-gray-800 transition-transform group-hover:translate-x-1" />}
    </Card>
  );
}
