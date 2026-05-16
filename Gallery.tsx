import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from '../components/Layout';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Share2, 
  Heart, 
  Image as ImageIcon, 
  Music as MusicIcon,
  Grid,
  List as ListIcon,
  LayoutGrid,
  History,
  Play
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Creation } from '../types';
import { format } from 'date-fns';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { DownloadMenu } from '../components/DownloadMenu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '../components/ui/dialog';
import { X, ExternalLink, Maximize2, AlertCircle, RefreshCw } from 'lucide-react';
import { CloudMediaWrapper } from '../components/CloudMediaWrapper';


export default function Gallery() {
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<Creation | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setCreations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'creations'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Creation[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Creation);
      });
      setCreations(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'creations');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you certain you want to delete this vision?')) return;
    try {
      await deleteDoc(doc(db, 'creations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `creations/${id}`);
    }
  };

  const toggleFavourite = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'creations', id), {
        isFavourite: !current
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `creations/${id}`);
    }
  };

  const filtered = creations.filter(c => {
    const matchesFilter = filter === 'all' || c.type === filter;
    const matchesSearch = c.input.toLowerCase().includes(search.toLowerCase()) || 
                         c.tool.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <Layout>
      <div className="p-6 space-y-8 flex flex-col h-full overflow-hidden">
        <header className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Vault</h1>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{filtered.length} Items</span>
               <div className="h-4 w-px bg-white/10" />
               <LayoutGrid size={16} className="text-purple-500" />
            </div>
          </div>

          <div className="space-y-4">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-purple-500" size={18} />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search visions by keyword or date..."
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                />
             </div>

             <Tabs defaultValue="all" onValueChange={setFilter} className="w-full">
                <TabsList className="bg-white/5 border border-white/10 w-full p-1 rounded-2xl h-12">
                   <TabsTrigger value="all" className="flex-1 rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest">All</TabsTrigger>
                   <TabsTrigger value="image" className="flex-1 rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest">Images</TabsTrigger>
                   <TabsTrigger value="audio" className="flex-1 rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest">Audio</TabsTrigger>
                </TabsList>
             </Tabs>
          </div>
        </header>

        <ScrollArea className="flex-1 pr-4 -mr-4">
           {loading ? (
             <div className="grid grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="aspect-square rounded-3xl bg-white/5 animate-pulse" />)}
             </div>
           ) : filtered.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-gray-700">
                   <History size={40} />
                </div>
                <div>
                   <p className="text-white font-bold uppercase tracking-tight">Your vault is empty</p>
                   <p className="text-gray-500 text-xs mt-1">Start creating to build your legacy.</p>
                </div>
                <Button variant="outline" className="rounded-full border-purple-500/30 text-purple-400 h-10 px-6">Create Vision</Button>
             </div>
           ) : (
             <div className="grid grid-cols-2 gap-4 pb-32">
                <AnimatePresence>
                  {filtered.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Card 
                        onClick={() => setSelectedItem(item)}
                        className="bg-white/5 border-white/5 rounded-3xl overflow-hidden group relative cursor-pointer active:scale-95 transition-transform"
                      >
                         <div 
                          className="aspect-square relative flex items-center justify-center bg-black overflow-hidden"
                         >
                            {item.outputUrl === 'DATA_TOO_LARGE' ? (
                              <div className="flex flex-col items-center justify-center p-4 text-center">
                                <History size={24} className="text-purple-500 mb-2 opacity-50" />
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Size Exceeded</p>
                                <p className="text-[8px] text-gray-600 mt-1 uppercase">Local session creation</p>
                              </div>
                            ) : (
                              <div className="relative aspect-square w-full h-full">
                                <CloudMediaWrapper uri={item.outputUrl} type={item.type}>
                                  {(resolvedUrl) => (
                                    <>
                                      {item.type === 'image' && (
                                        <img 
                                          src={resolvedUrl} 
                                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                          referrerPolicy="no-referrer" 
                                        />
                                      )}
                                      {item.type === 'video' && (
                                        <div className="relative w-full h-full">
                                          <video 
                                            src={resolvedUrl} 
                                            className="w-full h-full object-cover" 
                                            muted 
                                            playsInline
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                              <Play className="text-white fill-white ml-1" size={20} />
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      {item.type === 'audio' && (
                                        <div className="flex flex-col items-center gap-3">
                                          <MusicIcon size={48} className="text-purple-500 animate-pulse" />
                                          <div className="flex gap-1">
                                            {[1,2,3,4,5].map(i => (
                                              <div key={i} className="w-1 bg-purple-500/50 rounded-full animate-bounce" style={{ height: `${Math.random() * 20 + 5}px`, animationDelay: `${i * 0.1}s` }} />
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Hover Actions Overlay */}
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20 pointer-events-none group-hover:pointer-events-auto">
                                         <div onClick={(e) => e.stopPropagation()}>
                                           <DownloadMenu 
                                             url={resolvedUrl} 
                                             type={item.type} 
                                             mimeType={item.mimeType}
                                             downloadVariant="icon"
                                           />
                                         </div>
                                         <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(item.id);
                                          }} 
                                          className="w-10 h-10 rounded-full bg-red-600/20 text-red-500 border border-red-500/20 flex items-center justify-center hover:scale-110 hover:bg-red-600 hover:text-white transition-all shadow-xl"
                                         >
                                            <Trash2 size={18} />
                                         </button>
                                         <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedItem({ ...item, outputUrl: resolvedUrl });
                                          }} 
                                          className="w-10 h-10 rounded-full bg-white/10 text-white border border-white/10 flex items-center justify-center hover:scale-110 hover:bg-white hover:text-black transition-all shadow-xl"
                                         >
                                            <Maximize2 size={18} />
                                         </button>
                                      </div>
                                    </>
                                  )}
                                </CloudMediaWrapper>

                                <div className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 z-10 font-bold text-[10px] uppercase flex items-center gap-1.5 backdrop-blur-xl">
                                   {item.type === 'image' && <ImageIcon size={10} className="text-blue-500" />}
                                   {item.type === 'video' && <Play size={10} className="text-red-500" />}
                                   {item.type === 'audio' && <MusicIcon size={10} className="text-green-500" />}
                                   <span className="text-white/70">{item.type}</span>
                                </div>

                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavourite(item.id, item.isFavourite);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 transition-colors z-10 hover:bg-white/10"
                                >
                                   <Heart size={14} className={cn(item.isFavourite ? "fill-red-500 text-red-500" : "text-white")} />
                                </button>
                              </div>
                            )}
                         </div>
                         <div className="p-4 bg-white/5 border-t border-white/5">
                            <p className="text-[11px] font-black text-white truncate uppercase tracking-tighter mb-1">{item.tool}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-[9px] text-gray-500 font-medium">{format(new Date(item.createdAt), 'MMM dd, HH:mm')}</p>
                              <p className="text-[9px] text-purple-500/50 font-black uppercase tracking-widest">{item.quality || 'Standard'}</p>
                            </div>
                         </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>
           )}
        </ScrollArea>
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-4xl bg-black/95 border-white/10 p-0 overflow-hidden rounded-[2rem] shadow-2xl backdrop-blur-2xl">
          {selectedItem && (
            <CloudMediaWrapper uri={selectedItem.outputUrl} type={selectedItem.type}>
              {(resolvedUrl) => (
                <>
                  <DialogHeader className="p-6 border-b border-white/5 flex flex-row items-center justify-between">
                     <div>
                        <DialogTitle className="text-xl font-black uppercase tracking-tighter text-white">
                          {selectedItem?.tool}
                        </DialogTitle>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                          Generated {selectedItem && format(new Date(selectedItem.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                     </div>
                  </DialogHeader>
                  
                  <div className="p-4 md:p-8 space-y-6">
                     <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 group shadow-2xl">
                        {resolvedUrl === 'DATA_TOO_LARGE' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-4 bg-white/5">
                             <History size={64} className="text-purple-500 opacity-20" />
                             <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Neural Link Synthesis</h3>
                             <p className="text-gray-500 text-sm max-w-md uppercase tracking-tight">
                                This creation exceeds standard cloud relay limits. 
                                Direct neural access is required for full spectrum vision.
                             </p>
                          </div>
                        ) : (
                          <>
                            {selectedItem?.type === 'image' && (
                              <img 
                                src={resolvedUrl} 
                                className="w-full h-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)]" 
                                referrerPolicy="no-referrer" 
                              />
                            )}
                            {selectedItem?.type === 'video' && (
                               <video 
                                 src={resolvedUrl} 
                                 className="w-full h-full" 
                                 controls 
                                 autoPlay
                               />
                            )}
                            {selectedItem?.type === 'audio' && (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-purple-900/40 to-black p-8">
                                 <div className="relative">
                                    <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full animate-pulse" />
                                    <MusicIcon size={120} className="text-purple-500 relative z-10" />
                                 </div>
                                 <audio src={resolvedUrl} controls className="w-full max-w-md accent-purple-500" />
                                 <div className="text-center space-y-2">
                                    <p className="text-xs text-purple-400 font-black uppercase tracking-[0.3em]">Neural Frequency Decoded</p>
                                    <p className="text-[10px] text-gray-500 uppercase">{selectedItem?.tool}</p>
                                 </div>
                              </div>
                            )}
                          </>
                        )}
                     </div>

                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Neural Prompt</p>
                            <p className="text-xs text-white leading-relaxed font-medium bg-white/5 p-4 rounded-2xl border border-white/5">
                              {selectedItem?.input}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 justify-end">
                          <div className="flex gap-3">
                            {resolvedUrl !== 'DATA_TOO_LARGE' ? (
                              <DownloadMenu 
                                url={resolvedUrl} 
                                type={selectedItem?.type || 'image'} 
                                mimeType={selectedItem?.mimeType}
                                className="flex-1 h-14 bg-white text-black hover:bg-white/90 font-black rounded-2xl"
                              />
                            ) : (
                              <Button disabled className="flex-1 h-14 bg-white/10 text-gray-500 font-black rounded-2xl">
                                Unavailable for Cloud Export
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => selectedItem && toggleFavourite(selectedItem.id, selectedItem.isFavourite)}
                              className="h-14 w-14 rounded-2xl border-white/10 bg-white/5"
                            >
                              <Heart className={cn(selectedItem?.isFavourite && "fill-red-500 text-red-500")} />
                            </Button>
                          </div>
                          <Button 
                            variant="ghost" 
                            className="w-full h-12 text-red-500 hover:bg-red-500/10 hover:text-red-400 font-bold uppercase text-[10px] tracking-widest rounded-xl"
                            onClick={() => {
                              if (selectedItem) {
                                handleDelete(selectedItem.id);
                                setSelectedItem(null);
                              }
                            }}
                          >
                            Permanently Delete Vision
                          </Button>
                        </div>
                     </div>
                  </div>
                </>
              )}
            </CloudMediaWrapper>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
