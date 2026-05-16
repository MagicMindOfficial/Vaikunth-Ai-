/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { motion } from 'motion/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Logo } from './components/Logo';
import SplashScreen from './pages/SplashScreen';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import ImageTools from './pages/ImageTools';
import AudioTools from './pages/AudioTools';
import Assistant from './pages/Assistant';
import Gallery from './pages/Gallery';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
      <div className="relative flex flex-col items-center gap-12">
        {/* Soft Glow Background */}
        <div className="absolute inset-0 bg-purple-600/5 blur-[100px] rounded-full scale-150 animate-pulse" />
        
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute w-64 h-64 bg-purple-500 rounded-full blur-[80px]"
          />
          <div className="relative z-10 transition-transform duration-1000 scale-110">
             <Logo size={120} animated={true} />
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-4 relative z-10">
          {/* Progress element can stay or go, but the text must go */}
          <div className="h-[1px] w-32 bg-white/10 relative overflow-hidden rounded-full">
            <motion.div 
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAdmin) return <Navigate to="/home" />;
  return <>{children}</>;
}

export default function App() {
  const hasOnboarded = localStorage.getItem('visionai_onboarded') === 'true';

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={hasOnboarded ? <Login /> : <Navigate to="/onboarding" />} />
          <Route path="/signup" element={<Login />} /> {/* Using same page for now */}
          
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/image-tools" element={<ProtectedRoute><ImageTools /></ProtectedRoute>} />
          <Route path="/audio-tools" element={<ProtectedRoute><AudioTools /></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
          <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/privacy-policy" element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />
          <Route path="/terms" element={<ProtectedRoute><Terms /></ProtectedRoute>} />
          
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
