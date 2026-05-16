import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';
import { Fingerprint, Mail, Lock, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, user, loading: authLoading } = useAuth();
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

  if (!authLoading && user) {
    return <Navigate to="/home" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (email === adminEmail) {
        alert("Welcome Admin");
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err: any) {
      if (email === adminEmail && password === import.meta.env.VITE_ADMIN_PASSWORD) {
        setError(`Welcome Admin. Account not registered. Please use Google Sign In first with ${adminEmail}`);
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user.email === adminEmail) {
        alert("Welcome Admin");
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-full scale-150" />
            <Logo size={100} animated={true} showText={true} />
          </div>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium bg-red-500/10 py-2 rounded-lg">{error}</p>}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(124,58,237,0.4)] transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : (
              <>
                PROCEED TO VISION <ChevronRight size={20} />
              </>
            )}
          </Button>

          <div className="flex flex-col gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={loginWithGoogle}
              className="w-full h-12 bg-white/5 border-white/10 text-white rounded-xl hover:bg-white/10"
            >
              Sign in with Google
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full text-purple-400 hover:text-purple-300 gap-2"
            >
              <Fingerprint size={24} /> Biometric Login
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-gray-500">
          New to Vaikunth AI? <Link to="/signup" className="text-white font-bold hover:underline">Create Account</Link>
        </p>

        <div className="pt-8 border-t border-white/5 flex flex-col items-center">
            <span className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-medium">Vaikunth AI Security Vault</span>
        </div>
      </motion.div>
    </div>
  );
}
