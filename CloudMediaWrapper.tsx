import * as React from 'react';
import { useState, useEffect } from 'react';
import { fetchCloudMedia, isCloudUri } from '../lib/cloud-media';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface CloudMediaWrapperProps {
  uri: string;
  type: 'image' | 'audio' | 'video';
  children: (resolvedUrl: string) => React.ReactNode;
}

export function CloudMediaWrapper({ uri, type, children }: CloudMediaWrapperProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uri) return;

    if (!isCloudUri(uri)) {
      setResolvedUrl(uri);
      return;
    }

    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = await fetchCloudMedia(uri);
        if (isMounted) setResolvedUrl(url);
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
      if (resolvedUrl && resolvedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resolvedUrl);
      }
    };
  }, [uri]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
        <RefreshCw className="animate-spin text-white/20" size={24} />
        <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mt-2 text-center px-4">Neural Link Active...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-red-500/10 p-4 text-center">
        <AlertCircle className="text-red-500/50 mb-2" size={24} />
        <p className="text-[8px] text-red-500 font-black uppercase tracking-widest leading-tight">Neural Sync Lost</p>
        <p className="text-[8px] text-red-500/50 mt-1 uppercase leading-tight line-clamp-2">Key Mismatch or Expiry</p>
      </div>
    );
  }

  if (!resolvedUrl) return null;

  return <>{children(resolvedUrl)}</>;
}
