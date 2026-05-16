import * as React from 'react';
import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Image, Music, Sparkles, FolderHeart, Settings, User as UserIcon, LogOut, CreditCard, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Logo } from './Logo';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const firstName = profile?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Visionary';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Top Header */}
      {!hideNav && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-xl border-b border-white/10 px-6 flex items-center justify-between z-50 shadow-2xl">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/home')}>
             <motion.div
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
             >
               <Logo size={28} />
             </motion.div>
             <h1 className="text-xl font-black text-white tracking-widest uppercase italic group-hover:text-purple-400 transition-colors">Vaikunth AI</h1>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer group hover:bg-white/5 py-1 px-3 rounded-full transition-all border border-transparent hover:border-white/10">
                  <span className="text-xs font-bold text-gray-400 hidden sm:inline">Welcome, <span className="text-white">{firstName}</span></span>
                  <Avatar className="h-8 w-8 rounded-full border border-purple-500/40 ring-4 ring-purple-500/0 group-hover:ring-purple-500/20 transition-all">
                    <AvatarImage src={profile?.photoURL || ''} />
                    <AvatarFallback className="bg-purple-600 text-[10px] font-bold">
                      {firstName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-black/95 backdrop-blur-3xl border-white/10 text-white rounded-2xl p-2 shadow-2xl" align="end">
                <DropdownMenuLabel className="px-3 py-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-black uppercase tracking-tight">{profile?.displayName || 'Visionary'}</p>
                    <p className="text-[10px] font-medium uppercase text-gray-500 tracking-widest leading-none">{profile?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl py-3 px-3 focus:bg-white/10 hover:bg-white/10 cursor-pointer gap-3 group">
                  <UserCircle size={18} className="text-purple-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-widest">My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/gallery')} className="rounded-xl py-3 px-3 focus:bg-white/10 hover:bg-white/10 cursor-pointer gap-3 group">
                  <FolderHeart size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-widest">My Gallery</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-xl py-3 px-3 focus:bg-white/10 hover:bg-white/10 cursor-pointer gap-3 group">
                  <CreditCard size={18} className="text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-widest">Plan & Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-xl py-3 px-3 focus:bg-white/10 hover:bg-white/10 cursor-pointer gap-3 group">
                  <Settings size={18} className="text-gray-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={handleLogout} className="rounded-xl py-3 px-3 focus:bg-red-500/20 hover:bg-red-500/20 text-red-500 cursor-pointer gap-3 font-bold justify-center mt-2 border border-red-500/20">
                  <LogOut size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Terminate Session</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      )}

      <main className={cn("flex-1 pb-40 h-screen overflow-y-auto pt-16", hideNav && "pt-0")}>
        {children}
        
        {!hideNav && (
          <footer className="p-12 border-t border-white/5 bg-black flex flex-col items-center gap-6 mt-12 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black">
             <Logo size={64} />
             <div className="text-center space-y-2">
                <h3 className="text-xl font-black uppercase tracking-[0.4em]">Vaikunth AI</h3>
                <p className="text-[10px] text-purple-400/60 font-bold uppercase tracking-[0.3em]">Create Beyond Limits</p>
             </div>
             <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
             <p className="text-[8px] text-gray-700 uppercase tracking-widest">© 2024 Vaikunth AI | Create Beyond Limits</p>
          </footer>
        )}
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-xl border-t border-white/10 px-4 flex items-center justify-around z-50">
          <NavItem to="/home" icon={<Home size={24} />} label="Home" />
          <NavItem to="/image-tools" icon={<Image size={24} />} label="Images" />
          <NavItem to="/assistant" icon={<Sparkles size={24} />} label="AI" />
          <NavItem to="/audio-tools" icon={<Music size={24} />} label="Audio" />
          <NavItem to="/gallery" icon={<FolderHeart size={24} />} label="Gallery" />
          <NavItem to="/settings" icon={<Settings size={24} />} label="Settings" />
        </nav>
      )}
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center gap-1 transition-all duration-300",
          isActive ? "text-purple-500 scale-110" : "text-gray-500 hover:text-gray-300"
        )
      }
    >
      <div className="relative">
        {icon}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </NavLink>
  );
}
