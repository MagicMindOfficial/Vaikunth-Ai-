import * as React from 'react';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { 
  User, 
  Camera, 
  Save, 
  ArrowLeft, 
  Mail, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Gem,
  BadgeCheck
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../lib/firebase';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function Profile() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [password, setPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    setMessage(null);

    try {
      // 1. Update Firebase Auth Profile
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL
      });

      // 2. Update Email if changed
      if (email !== user.email && email.trim() !== '') {
        try {
          await updateEmail(user, email);
        } catch (err: any) {
          if (err.code === 'auth/requires-recent-login') {
            throw new Error('Please logout and login again to change sensitive data.');
          }
          throw err;
        }
      }

      // 3. Update Password if provided
      if (password.trim() !== '') {
        try {
          await updatePassword(user, password);
        } catch (err: any) {
          if (err.code === 'auth/requires-recent-login') {
            throw new Error('Please logout and login again to change sensitive data.');
          }
          throw err;
        }
      }

      // 4. Update Firestore Doc
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          displayName,
          email,
          photoURL
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
        return;
      }

      setMessage({ type: 'success', text: 'Neural profile synchronized successfully.' });
      setPassword('');
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failure in neural link update.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app we'd upload to Firebase Storage
      // For this preview, we'll use a local URL or base64 placeholder
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto space-y-8 pb-32">
        <header className="flex items-center justify-between">
           <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-white/50 hover:text-white bg-white/5" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
           </Button>
           <h1 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500">Core Identity</h1>
           <div className="w-10 h-10" /> {/* Spacer */}
        </header>

        <section className="flex flex-col items-center gap-6">
           <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-purple-600 via-indigo-600 to-black p-1 shadow-[0_0_40px_rgba(124,58,237,0.3)]"
              >
                <div className="w-full h-full rounded-[2.3rem] bg-black flex items-center justify-center overflow-hidden">
                   {photoURL ? (
                     <img src={photoURL} alt="Identity" className="w-full h-full object-cover" />
                   ) : (
                     <User size={56} className="text-purple-500" />
                   )}
                </div>
              </motion.div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-2xl border-4 border-black group-hover:bg-purple-400 transition-colors">
                <Camera size={18} />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
           </div>

           <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-400/10 rounded-full border border-yellow-400/20">
                 <Gem size={14} className="text-yellow-400" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">{profile?.plan || 'Starter'} Entity</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">{profile?.displayName || 'Unknown Visionary'}</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{profile?.email}</p>
           </div>
        </section>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-2xl flex items-center gap-3 border",
              message.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
            )}
          >
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-bold uppercase tracking-wider">{message.text}</span>
          </motion.div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-6">
           <Card className="bg-white/5 border-white/5 p-8 space-y-6 rounded-[2rem]">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Identity Name</Label>
                    <div className="relative">
                       <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" />
                       <input 
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your visionary moniker"
                          className="w-full h-14 bg-black border border-white/10 rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-all font-bold tracking-tight"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Communication Channel</Label>
                    <div className="relative">
                       <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                       <input 
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="primary@vision.ai"
                          className="w-full h-14 bg-black border border-white/10 rounded-2xl pl-12 pr-4 text-white focus:border-purple-500 transition-all font-medium"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">New Security Key (Password)</Label>
                    <div className="relative">
                       <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" />
                       <input 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Leave blank to keep current"
                          className="w-full h-14 bg-black border border-white/10 rounded-2xl pl-12 pr-4 text-white focus:border-purple-500 transition-all font-medium"
                       />
                    </div>
                 </div>
              </div>

              <div className="pt-4">
                 <Button 
                    type="submit" 
                    disabled={isUpdating}
                    className="w-full h-16 bg-gradient-to-r from-purple-600 to-indigo-600 hover:to-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] gap-3"
                 >
                    {isUpdating ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    Synchronize Neural Data
                 </Button>
              </div>
           </Card>

           <Card className="bg-white/5 border-white/5 p-8 space-y-6 rounded-[2rem]">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                       <Lock size={16} className="text-red-500" />
                       Security Vault
                    </h3>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Update your access key</p>
                 </div>
                 <Button variant="outline" className="rounded-full border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest px-4 h-8">
                    Reset Password
                 </Button>
              </div>
           </Card>
        </form>

        <footer className="pt-6 flex flex-col items-center gap-4">
           <div className="flex items-center gap-2">
              <BadgeCheck size={16} className="text-purple-400" />
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-none">Registered Since {new Date(profile?.joinedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
           </div>
           <p className="text-[9px] text-gray-800 font-black uppercase tracking-[0.2em]">Vaikunth AI Identity Module v2.0</p>
        </footer>
      </div>
    </Layout>
  );
}
