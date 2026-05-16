import * as React from 'react';
import { 
  Download, 
  Check, 
  Sparkles, 
  Scissors, 
  Lock,
  ChevronDown
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface DownloadMenuProps {
  url: string;
  type: 'image' | 'audio';
  mimeType?: string;
  filename?: string;
  className?: string;
  downloadVariant?: 'default' | 'outline' | 'ghost' | 'icon';
}

export function DownloadMenu(props: DownloadMenuProps) {
  const { url, type, mimeType, filename, className, downloadVariant = 'default' } = props;
  const { profile } = useAuth();
  const plan = profile?.plan || 'Starter';

  const getExtension = () => {
    if (mimeType) {
      if (mimeType.includes('wav')) return 'wav';
      if (mimeType.includes('mpeg') || mimeType.includes('mp3')) return 'mp3';
      if (mimeType.includes('png')) return 'png';
      if (mimeType.includes('jpeg')) return 'jpg';
      if (mimeType.includes('mp4')) return 'mp4';
      if (mimeType.includes('webm')) return 'webm';
    }
    
    // Fallback based on type
    if (type === 'image') return 'png';
    if (type === 'audio') return 'mp3';
    return 'bin';
  };

  const downloadFile = (quality: string) => {
    const link = document.createElement('a');
    link.href = url;
    const extension = getExtension();
    
    let finalFilename = filename || `visionai-${type}-${Date.now()}-${quality}`;
    
    // If filename has no extension or doesn't match the expected extension, append/fix it
    const hasExtension = finalFilename.includes('.');
    if (!hasExtension) {
      finalFilename = `${finalFilename}.${extension}`;
    } else {
      // Validate or replace extension if it's potentially wrong (e.g. .wav for mp3)
      const parts = finalFilename.split('.');
      const currentExt = parts[parts.length - 1];
      if (currentExt !== extension && (extension === 'mp3' || extension === 'wav')) {
         // If it's a critical difference like wav vs mp3, we should probably nudge it
         // But for now let's just make sure it's consistent
         parts[parts.length - 1] = extension;
         finalFilename = parts.join('.');
      }
    }

    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLocked = (qualityId: string) => {
    if (qualityId === 'high') {
      return plan === 'Starter';
    }
    return false;
  };

  const getQualityBadge = (qualityId: string) => {
    if (qualityId === 'high') {
      if (plan === 'Starter') return <Lock size={12} className="text-gray-500" />;
      if (plan === 'Creator') return <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-black uppercase">2K</span>;
      if (plan === 'Studio') return <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full font-black uppercase">4K</span>;
    }
    return null;
  };

  const isIcon = (downloadVariant as string) === 'icon';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isIcon ? (
          <button className={cn("w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg", className)}>
            <Download size={18} />
          </button>
        ) : (
          <Button variant={isIcon ? 'default' : downloadVariant as any} className={cn("gap-2 font-bold rounded-2xl", className)}>
            <Download size={20} /> DOWNLOAD {!isIcon && <ChevronDown size={14} className="opacity-50" />}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#0a0a0a] border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-3 py-2">
          Select Download Quality
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5 mx-1" />
        
        <DropdownMenuItem 
          onClick={() => downloadFile('compressed')}
          className="flex items-center justify-between px-3 py-3 rounded-xl focus:bg-white/5 cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-500/10 text-gray-400 group-hover:text-white transition-colors">
              <Scissors size={14} />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-tight">Compressed</p>
              <p className="text-[9px] text-gray-500 font-medium">Small file size, 720p</p>
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => downloadFile('standard')}
          className="flex items-center justify-between px-3 py-3 rounded-xl focus:bg-white/5 cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:text-white transition-colors">
              <Download size={14} />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-tight">Standard</p>
              <p className="text-[9px] text-gray-500 font-medium">Default, 1080p High</p>
            </div>
          </div>
          <Check size={14} className="text-purple-500" />
        </DropdownMenuItem>

        <DropdownMenuItem 
          disabled={isLocked('high')}
          onClick={() => !isLocked('high') && downloadFile('high')}
          className={cn(
            "flex items-center justify-between px-3 py-3 rounded-xl focus:bg-white/5 cursor-pointer group",
            isLocked('high') && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg bg-amber-500/10",
              isLocked('high') ? "text-gray-600" : "text-amber-500 group-hover:text-white transition-colors"
            )}>
              <Sparkles size={14} />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-tight">High-Fidelity</p>
              <p className="text-[9px] text-gray-500 font-medium">
                {isLocked('high') ? 'Unlock with Creator plan' : (plan === 'Studio' ? 'Studio Grade 4K' : 'Professional 2K')}
              </p>
            </div>
          </div>
          {getQualityBadge('high')}
        </DropdownMenuItem>

        {isLocked('high') && (
          <>
            <DropdownMenuSeparator className="bg-white/5 mx-1" />
            <div className="px-3 py-2">
              <Button size="sm" className="w-full h-8 bg-purple-600 text-[9px] font-black uppercase tracking-widest rounded-lg">
                Upgrade Plan
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
