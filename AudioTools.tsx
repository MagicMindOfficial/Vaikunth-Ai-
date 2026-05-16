import * as React from 'react';
import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Layout } from '../components/Layout';
import { 
  Mic2, 
  Music, 
  Volume2, 
  Waves, 
  Download, 
  Play, 
  RefreshCw, 
  ArrowLeft,
  ChevronRight,
  Smile,
  Frown,
  Angry,
  Zap,
  Sliders,
  AudioWaveform
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ai, MODELS } from '../lib/gemini';
import { Modality } from "@google/genai";
import { cn } from '../lib/utils';
import * as Tone from 'tone';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

const VOICES = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Premium Male (Adam)', icon: <Volume2 /> },
  { id: 'MF3mGyEY3pHO7DPP311i', name: 'Premium Female (Lily)', icon: <Volume2 /> },
  { id: 'VR6AewrYg78iXAb8Zhbv', name: 'Deep Narrator (Arnold)', icon: <Volume2 /> },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Soft Female (Bella)', icon: <Volume2 /> },
  { id: 'XB0fDUnXUByWwe3m9786', name: 'Executive Female (Charlotte)', icon: <Waves size={18} /> },
];

const EMOTIONS = [
  { id: 'neutral', name: 'Neutral', icon: <Zap size={14} /> },
  { id: 'happy', name: 'Warm', icon: <Smile size={14} /> },
  { id: 'sad', name: 'Deep', icon: <Frown size={14} /> },
  { id: 'angry', name: 'Intense', icon: <Angry size={14} /> },
];

import { DownloadMenu } from '../components/DownloadMenu';
import { PremiumLoadingOverlay } from '../components/PremiumLoadingOverlay';

export default function AudioTools() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('pNInz6obpgDQGcFmaJgB');
  const [emotion, setEmotion] = useState('neutral');
  const [speed, setSpeed] = useState('1.0');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  
  // Effect States
  const [reverb, setReverb] = useState(0); 
  const [echo, setEcho] = useState(0); 
  const [pitch, setPitch] = useState(0); 
  
  const { user } = useAuth();
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const startTone = async () => {
    try {
      if (Tone.getContext().state !== 'running') {
        await Tone.getContext().resume();
        await Tone.start();
        console.log('Tone.js Neural context initialized');
      }
    } catch (e) {
      console.error('Tone.js failed to start:', e);
    }
  };

  const handleGenerate = async () => {
    if (!text) return;
    setError(null);
    await startTone();
    setIsGenerating(true);
    setAudioUrl(null);
    setProcessedUrl(null);
    try {
      const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
      
      if (!ELEVENLABS_API_KEY) {
        throw new Error("Synthesis Link Offline: ElevenLabs API Key is missing. Please configure VITE_ELEVENLABS_API_KEY.");
      }
      
      let response;
      if (selectedTool === 'tts') {
        response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}?output_format=mp3_44100_128`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: emotion === 'neutral' ? 0.5 : (emotion === 'happy' ? 0.6 : 0.4),
              similarity_boost: 0.75,
              style: emotion === 'angry' ? 0.1 : 0.0,
              use_speaker_boost: true
            }
          }),
        });
      } else {
        // Sound Effects
        response = await fetch(`https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: text,
            duration_seconds: 10,
            prompt_influence: 0.3
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || "Synthesis nexus failed to activate.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      setAudioUrl(url);
      setProcessedUrl(url);
      
      if (user) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const sizeInBytes = blob.size;
          const isTooLarge = sizeInBytes > 1000000;

          // Save to Firestore
          try {
            await addDoc(collection(db, 'creations'), {
              userId: user.uid,
              type: 'audio',
              tool: selectedTool === 'tts' ? 'Text to Speech' : 'Sound Effects',
              input: text,
              outputUrl: isTooLarge ? 'DATA_TOO_LARGE' : base64data,
              mimeType: blob.type || 'audio/mpeg',
              createdAt: new Date().toISOString(),
              quality: 'Neural HD',
              isFavourite: false,
              sizeError: isTooLarge
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'creations');
          }
        };
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'The neural audio link broke. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyEffects = async () => {
    if (!audioUrl) return;
    setIsProcessing(true);
    
    try {
      const buffer = await (await fetch(audioUrl)).arrayBuffer();
      const audioBuffer = await Tone.getContext().decodeAudioData(buffer);
      
      const duration = audioBuffer.duration;
      
      const renderedBuffer = await Tone.Offline(async (context) => {
        const player = new Tone.Player(audioBuffer);
        
        const effects: any[] = [];
        
        // Pitch Shift
        if (pitch !== 0) {
          const ps = new Tone.PitchShift(pitch);
          effects.push(ps);
        }
        
        // Echo
        if (echo > 0) {
          const delay = new Tone.FeedbackDelay("8n", echo * 0.6);
          effects.push(delay);
        }
        
        // Reverb
        if (reverb > 0) {
          const rev = new Tone.Freeverb(reverb * 0.82, 3000);
          effects.push(rev);
        }

        if (effects.length > 0) {
          player.chain(...effects, Tone.Destination);
        } else {
          player.toDestination();
        }

        player.start(0);
      }, duration);

      const wav = audioBufferToWav(renderedBuffer.get());
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
    } catch (err) {
      console.error("Effect processing failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const audioBufferToWav = (buffer: AudioBuffer) => {
    let numOfChan = buffer.numberOfChannels,
        length = buffer.length * numOfChan * 2 + 44,
        bufferArr = new ArrayBuffer(length),
        view = new DataView(bufferArr),
        channels = [], i, sample,
        offset = 0,
        pos = 0;

    const setUint16 = (data: any) => {
        view.setUint16(pos, data, true);
        pos += 2;
    };

    const setUint32 = (data: any) => {
        view.setUint32(pos, data, true);
        pos += 4;
    };

    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);  // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    for(i = 0; i < buffer.numberOfChannels; i++)
        channels.push(buffer.getChannelData(i));

    while(pos < length) {
        for(i = 0; i < numOfChan; i++) {           
            sample = Math.max(-1, Math.min(1, channels[i][offset])); 
            sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0; 
            view.setInt16(pos, sample, true);          
            pos += 2;
        }
        offset++;                                  
    }

    return bufferArr;
  };

  return (
    <Layout>
      <PremiumLoadingOverlay isVisible={isGenerating} message="Synthesizing Neural Audio..." />
      <div className="p-6 space-y-8">
        {!selectedTool ? (
          <div className="space-y-10">
              <header className="space-y-2">
                <h1 className="text-3xl font-black uppercase tracking-tighter gold-text">Audio Lab</h1>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Select your Vaikunth AI tool</p>
             </header>

             <div className="space-y-4">
                <motion.div whileHover="hover">
                  <Card 
                    onClick={() => setSelectedTool('tts')}
                    className="bg-white/5 border-white/5 p-8 flex items-center justify-between group cursor-pointer hover:bg-green-600/10 transition-all border-l-4 border-l-transparent hover:border-l-green-500 rounded-[2.5rem]"
                  >
                    <div className="flex items-center gap-6">
                      <div className="p-5 rounded-full bg-black border border-white/10 text-green-500 transition-all group-hover:border-green-500/30">
                        <motion.div
                          variants={{
                            hover: { 
                              y: [0, -3, 0],
                              scale: [1, 1.05, 1],
                              transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
                            }
                          }}
                        >
                          <Volume2 size={32} />
                        </motion.div>
                      </div>
                      <div>
                         <h3 className="text-xl font-bold text-white uppercase tracking-tight">Text to Speech</h3>
                         <p className="text-xs text-gray-500 uppercase tracking-widest">Neural Voice Engine</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-800" />
                  </Card>
                </motion.div>

                <motion.div whileHover="hover">
                  <Card 
                    onClick={() => setSelectedTool('sfx')}
                    className="bg-white/5 border-white/5 p-8 flex items-center justify-between group cursor-pointer hover:bg-blue-600/10 transition-all border-l-4 border-l-transparent hover:border-l-blue-500 rounded-[2.5rem]"
                  >
                    <div className="flex items-center gap-6">
                      <div className="p-5 rounded-full bg-black border border-white/10 text-blue-500 transition-all group-hover:border-blue-500/30">
                        <motion.div
                          variants={{
                            hover: { 
                              y: [0, -3, 0],
                              rotate: [0, 5, -5, 0],
                              transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                            }
                          }}
                        >
                          <Waves size={32} />
                        </motion.div>
                      </div>
                      <div>
                         <h3 className="text-xl font-bold text-white uppercase tracking-tight">Sound Effects</h3>
                         <p className="text-xs text-gray-500 uppercase tracking-widest">AI Generated Soundscapes</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-800" />
                  </Card>
                </motion.div>

                <motion.div whileHover="hover">
                  <Card 
                    onClick={() => setSelectedTool('effects')}
                    className="bg-white/5 border-white/5 p-8 flex items-center justify-between group cursor-pointer hover:bg-purple-600/10 transition-all border-l-4 border-l-transparent hover:border-l-purple-500 rounded-[2.5rem]"
                  >
                    <div className="flex items-center gap-6">
                      <div className="p-5 rounded-full bg-black border border-white/10 text-purple-500 transition-all group-hover:border-purple-500/30">
                        <motion.div
                          variants={{
                            hover: { 
                              scale: [1, 1.1, 1],
                              transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
                            }
                          }}
                        >
                          <Sliders size={32} />
                        </motion.div>
                      </div>
                      <div>
                         <h3 className="text-xl font-bold text-white uppercase tracking-tight">Audio FX</h3>
                         <p className="text-xs text-gray-500 uppercase tracking-widest">Studio Grade Modulators</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-800" />
                  </Card>
                </motion.div>
             </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 pb-12">
             <Button variant="ghost" onClick={() => { setSelectedTool(null); setAudioUrl(null); setProcessedUrl(null); }} className="text-gray-500 gap-2">
                <ArrowLeft size={16} /> Back to Lab
             </Button>

             <header className="space-y-1">
               <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
                 {selectedTool === 'tts' ? 'Neural Synthesis' : selectedTool === 'sfx' ? 'Atmospheric Forge' : 'Studio FX'}
               </h1>
               <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Neural Audio Engine v2.1</p>
             </header>

             <Card className="bg-white/5 border-white/10 p-6 space-y-8 rounded-[2rem]">
                {selectedTool === 'tts' || selectedTool === 'sfx' ? (
                  <>
                    {selectedTool === 'tts' && (
                      <div className="space-y-2">
                        <Label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Voice Avatar</Label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {VOICES.map((voice) => (
                              <button 
                                key={voice.id}
                                onClick={() => setSelectedVoice(voice.id)}
                                className={cn(
                                  "flex-none flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase transition-all",
                                  selectedVoice === voice.id ? "bg-white text-black border-white" : "bg-black text-gray-400 border-white/10"
                                )}
                              >
                                {voice.name}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                       <Label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{selectedTool === 'tts' ? 'Input Text' : 'Sound Description'}</Label>
                       <textarea 
                         value={text}
                         onChange={(e) => setText(e.target.value)}
                         className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-700 min-h-[100px] resize-none text-sm focus:ring-1 focus:ring-white"
                         placeholder={selectedTool === 'tts' ? "Synthesize your vision into sound..." : "A futuristic engine starting up, deep hum with electrical sparks..."}
                       />
                    </div>

                    {selectedTool === 'tts' && (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Emotion</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {EMOTIONS.map((emo) => (
                                  <button 
                                    key={emo.id}
                                    onClick={() => setEmotion(emo.id)}
                                    className={cn(
                                      "flex items-center justify-center gap-2 h-10 rounded-xl border text-[10px] uppercase font-bold",
                                      emotion === emo.id ? "bg-green-500 border-green-500 text-white" : "bg-white/5 border-white/10 text-gray-500"
                                    )}
                                  >
                                    {emo.icon} {emo.name}
                                  </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Cadence</Label>
                             <select 
                               value={speed} 
                               onChange={(e) => setSpeed(e.target.value)}
                               className="w-full h-10 bg-black border border-white/10 rounded-xl px-4 text-[10px] font-bold uppercase text-white outline-none"
                             >
                                <option value="0.8">Cinema Slow</option>
                                <option value="1.0">Standard</option>
                                <option value="1.2">Fast</option>
                                <option value="1.5">Hyper Fast</option>
                             </select>
                        </div>
                      </div>
                    )}

                    <Button 
                       onClick={handleGenerate}
                       disabled={isGenerating}
                       className={cn(
                         "w-full h-14 font-black text-sm rounded-2xl transition-all shadow-lg",
                         selectedTool === 'tts' ? "bg-green-600 hover:bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
                       )}
                    >
                      {isGenerating ? <RefreshCw className="animate-spin" /> : (selectedTool === 'tts' ? 'IGNITE SYNTHESIS' : 'FORGE SOUNDSCAPE')}
                    </Button>

                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <AudioWaveform size={48} className="text-purple-500 opacity-20" />
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Effect Lab works on generated output</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedTool('tts')}
                      className="border-white/10 text-[10px] font-bold uppercase"
                    >
                      Go to Synthesis first
                    </Button>
                  </div>
                )}
             </Card>

             {audioUrl && (
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-8">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                          <Waves size={32} className="animate-pulse" />
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Neural Output</Label>
                            {isProcessing && <RefreshCw size={10} className="animate-spin text-purple-500" />}
                          </div>
                          <div className="h-1 bg-white/10 rounded-full w-full relative">
                             <div className="absolute top-0 left-0 h-full bg-green-500 w-[65%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                          </div>
                       </div>
                       <audio 
                        ref={audioPlayerRef} 
                        src={processedUrl || audioUrl || ''} 
                        className="hidden" 
                        crossOrigin="anonymous"
                        playsInline
                       />
                       <button 
                        onClick={async () => {
                          await startTone();
                          if (audioPlayerRef.current) {
                            audioPlayerRef.current.currentTime = 0;
                            const playPromise = audioPlayerRef.current.play();
                            if (playPromise !== undefined) {
                              playPromise.catch(error => {
                                console.error("Playback failed:", error);
                              });
                            }
                          }
                        }} 
                        className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-110 transition-transform active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                       >
                          <Play size={24} fill="currentColor" />
                       </button>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-6">
                       <header className="flex items-center gap-2">
                          <Sliders size={14} className="text-purple-500" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Studio Post-Processing</h4>
                       </header>
                       
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                             <div className="flex justify-between items-center">
                                <Label className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Reverb Depth</Label>
                                <span className="text-[10px] font-mono text-purple-500">{Math.round(reverb * 100)}%</span>
                             </div>
                             <input 
                              type="range" min="0" max="1" step="0.1" value={reverb} 
                              onChange={(e) => setReverb(parseFloat(e.target.value))}
                              className="w-full accent-purple-500 h-1 rounded-full cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                             />
                          </div>

                          <div className="space-y-3">
                             <div className="flex justify-between items-center">
                                <Label className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Temporal Echo</Label>
                                <span className="text-[10px] font-mono text-purple-500">{Math.round(echo * 100)}%</span>
                             </div>
                             <input 
                              type="range" min="0" max="1" step="0.1" value={echo} 
                              onChange={(e) => setEcho(parseFloat(e.target.value))}
                              className="w-full accent-purple-500 h-1 rounded-full cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                             />
                          </div>

                          <div className="space-y-3">
                             <div className="flex justify-between items-center">
                                <Label className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Pitch Mod</Label>
                                <span className="text-[10px] font-mono text-purple-500">{pitch}st</span>
                             </div>
                             <input 
                              type="range" min="-12" max="12" step="1" value={pitch} 
                              onChange={(e) => setPitch(parseFloat(e.target.value))}
                              className="w-full accent-purple-500 h-1 rounded-full cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                             />
                          </div>
                       </div>

                       <Button 
                        onClick={applyEffects}
                        disabled={isProcessing}
                        className="w-full h-12 bg-purple-600/20 hover:bg-purple-600 text-purple-500 hover:text-white border border-purple-500/20 text-[10px] font-black uppercase tracking-widest transition-all"
                       >
                         {isProcessing ? <RefreshCw className="animate-spin mr-2" /> : 'Apply Digital Alchemy'}
                       </Button>
                    </div>
                  </div>

                  <DownloadMenu 
                    url={processedUrl || audioUrl || ''} 
                    type="audio" 
                    mimeType={processedUrl ? 'audio/wav' : 'audio/mpeg'}
                    className="w-full h-14 bg-white text-black hover:bg-white/90"
                    filename="vaikunthai_mastered.wav"
                  />
               </motion.div>
             )}
          </motion.div>
        )}
      </div>
      <div className="h-24" />
    </Layout>
  );
}
