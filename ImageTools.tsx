import * as React from 'react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Layout } from '../components/Layout';
import { 
  Plus, 
  Sparkles, 
  Image as ImageIcon, 
  Scissors, 
  RefreshCw, 
  Palette, 
  UserCircle2, 
  ArrowLeft,
  Download,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { ai, MODELS, safetySettings } from '../lib/gemini';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { DownloadMenu } from '../components/DownloadMenu';
import { PremiumLoadingOverlay } from '../components/PremiumLoadingOverlay';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

const TOOLS = [
  { id: 't2i', name: 'Text to Image', icon: <Plus size={20} />, desc: 'Dream into visuals', prompt: 'Create an image of...' },
  { id: 'i2i', name: 'Image to Image', icon: <RefreshCw size={20} />, desc: 'Evolve existing art', prompt: 'Redraw this as...' },
  { id: 'upscale', name: 'Image Upscaling', icon: <Zap size={20} />, desc: '4K clarity boost', prompt: 'Sharpen and upscale the details of this image to ultra-high resolution...' },
  { id: 'bg-remove', name: 'Remove BG', icon: <Scissors size={20} />, desc: 'Instant transparency', prompt: 'Isolate the subject...' },
  { id: 'cartoon', name: 'Anime & Toon', icon: <Palette size={20} />, desc: 'Stylized evolution', prompt: 'Convert this to anime...' },
  { id: 'face-swap', name: 'Face Swap', icon: <UserCircle2 size={20} />, desc: 'Identity alchemy', prompt: 'Swap the face from the source image onto the base image realistically. Match lighting and skin tone.', useTwoImages: true },
  { id: 'colorize', name: 'Colorize', icon: <Palette size={20} />, desc: 'Restore memories', prompt: 'Add color to this...' },
];

export default function ImageTools() {
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [faceSourceImage, setFaceSourceImage] = useState<string | null>(null);
  const [quality, setQuality] = useState('Standard');
  const [aspectRatio, setAspectRatio] = useState('1:1 (Square)');
  const { user } = useAuth();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isFaceSource = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isFaceSource) {
          setFaceSourceImage(reader.result as string);
        } else {
          setInputImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    if (selectedTool.useTwoImages && (!inputImage || !faceSourceImage)) {
      setError('Please upload both Base Image and Face Source Image.');
      return;
    }
    setError(null);

    const isHighQuality = quality === 'High' || quality === 'Studio 4K';
    const modelName = isHighQuality ? 'gemini-2.0-flash-exp' : MODELS.IMAGE;

    setIsGenerating(true);
    setResultImage(null);
    try {
      const currentApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      if (!currentApiKey) {
        throw new Error("Neural Link Offline: Gemini API Key is missing. Please configure VITE_GEMINI_API_KEY in the Secrets panel.");
      }
      const localAi = new GoogleGenAI({ apiKey: currentApiKey });
      
      // Enhance prompt to avoid policy filters on short prompts and improve quality
      const enhancedPrompt = prompt.trim().length < 15
        ? `A hyper-realistic, highly detailed cinematic masterpiece of ${prompt}, 8k resolution, professional studio lighting, detailed textures, sharp focus.`
        : prompt;

      const parts: any[] = [{ text: enhancedPrompt }];
      
      if (inputImage) {
        const base64Data = inputImage.split(',')[1];
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: "image/png"
          }
        });
      }

      if (selectedTool.useTwoImages && faceSourceImage) {
        const base64DataFace = faceSourceImage.split(',')[1];
        parts.push({
          inlineData: {
            data: base64DataFace,
            mimeType: "image/png"
          }
        });
      }

      console.log(`Generating image with model: ${modelName} and quality: ${quality}`);
      
      const ratio = aspectRatio.split(' ')[0]; // "1:1", "16:9", etc.
      
      // Map quality to standard descriptions for different backends
      let imageConfig: any = { 
        aspectRatio: ratio,
      };

      if (quality === 'Studio 4K') {
        imageConfig.imageSize = '4K';
      } else if (quality === 'High') {
        imageConfig.imageSize = '2K';
      }

      const response = await localAi.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
            safetySettings: safetySettings,
            // @ts-ignore
            imageConfig: imageConfig
        }
      });

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No visionary response received from the neural nexus.');
      }

      const candidate = response.candidates[0];
      
      if (candidate.finishReason === 'SAFETY') {
        throw new Error('Our neural safety protocols blocked this generation. Please try a more visionary and safe prompt.');
      }

      const finishReason = (candidate.finishReason || 'UNKNOWN') as any;
      
      if (finishReason === 'IMAGE_HAS_PERSON') {
        throw new Error('Our current neural policy restricts generating recognizable human faces in this mode. Please try a different vision.');
      }

      if (finishReason === 'IMAGE_OTHER' || finishReason === 'OTHER' || finishReason === 'BLOCKLIST' || finishReason === 'PROHIBITED_CONTENT') {
        throw new Error(`The neural nexus policy filter (Reason: ${finishReason}). This often occurs with ambiguous or short prompts. Please refine your vision with more descriptive keywords.`);
      }

      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error(`The neural output was empty or blocked (Reason: ${finishReason}). Try refining your vision.`);
      }

      let foundImage = false;
      let textResponse = '';

      // Deep scan of parts
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          const url = `data:${mimeType};base64,${part.inlineData.data}`;
          setResultImage(url);
          foundImage = true;
          
          if (user) {
            const sizeInBytes = new Blob([url]).size;
            const isTooLarge = sizeInBytes > 1000000;
            
            try {
              await addDoc(collection(db, 'creations'), {
                userId: user.uid,
                type: 'image',
                tool: selectedTool.name,
                input: prompt,
                outputUrl: isTooLarge ? 'DATA_TOO_LARGE' : url,
                createdAt: new Date().toISOString(),
                quality: quality,
                isFavourite: false,
                sizeError: isTooLarge
              });
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, 'creations');
            }
          }
          break;
        } else if (part.text) {
          textResponse += part.text;
        }
      }


      // Fallback: Check if the whole response can be interpreted as text that describes why it failed
      if (!foundImage && !textResponse) {
        try {
          textResponse = response.text;
        } catch (e) {
          // Ignore if text fails
        }
      }

      if (!foundImage) {
        console.error('No image found in parts. Text parts:', textResponse);
        if (textResponse) {
          throw new Error(`The neural nexus returned a text response instead of an image: "${textResponse.substring(0, 100)}..."`);
        }
        throw new Error('Neural output did not contain image data. Please try refining your prompt for more clarity.');
      }
    } catch (err: any) {
      console.error('Generation Detail:', err);
      setError(err.message || 'The neural nexus is currently unstable. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <PremiumLoadingOverlay isVisible={isGenerating} message={`Summoning ${selectedTool?.name || 'Vision'}...`} />
      <div className="p-6 space-y-8">
        {!selectedTool ? (
          <>
            <header className="space-y-2">
              <h1 className="text-3xl font-black uppercase tracking-tighter gold-text">Alchemy Studio</h1>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Select your Vaikunth AI tool</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
              {TOOLS.map((tool) => (
                <motion.div
                  key={tool.id}
                  whileHover="hover"
                  onClick={() => {
                    setSelectedTool(tool);
                    setPrompt(tool.prompt);
                  }}
                  className="group"
                >
                  <Card className="bg-white/5 border-white/5 p-6 flex items-center justify-between cursor-pointer hover:bg-purple-600/10 transition-all border-l-4 border-l-transparent hover:border-l-purple-500 rounded-[2rem]">
                    <div className="flex items-center gap-6">
                      <div className="p-4 rounded-[1.5rem] bg-black border border-white/10 text-purple-500 transition-colors group-hover:border-purple-500/30 group-hover:text-purple-400">
                        <motion.div
                          variants={{
                            hover: { 
                              y: [0, -4, 0],
                              scale: [1, 1.1, 1],
                              transition: { 
                                duration: 0.6,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }
                            }
                          }}
                        >
                          {tool.icon}
                        </motion.div>
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-white uppercase tracking-tight">{tool.name}</h3>
                         <p className="text-xs text-gray-500 uppercase tracking-widest">{tool.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-800" />
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <Button 
                  variant="ghost" 
                  onClick={() => { setSelectedTool(null); setResultImage(null); }}
                  className="text-gray-500 gap-2"
                >
                  <ArrowLeft size={16} /> Back to Studio
              </Button>
              {user && (user.email === import.meta.env.VITE_ADMIN_EMAIL) && (
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-2">
                  <Zap size={12} className="text-amber-500" />
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Admin Unlimited Access</span>
                </div>
              )}
            </div>

            <header className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
                  {selectedTool.icon}
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tighter text-white">{selectedTool.name}</h1>
              </div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">{selectedTool.desc}</p>
            </header>

            <Card className="bg-white/5 border-white/10 p-6 space-y-6">
               {(selectedTool.id === 'upscale' || selectedTool.id === 'i2i' || selectedTool.id === 'bg-remove' || selectedTool.id === 'face-swap') && (
                 <div className={cn("grid gap-4", selectedTool.useTwoImages ? "grid-cols-2" : "grid-cols-1")}>
                   <div className="space-y-2">
                     <Label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{selectedTool.useTwoImages ? 'Base Image' : 'Source Image'}</Label>
                     <div 
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="relative w-full aspect-video bg-black border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-all overflow-hidden group"
                     >
                       {inputImage ? (
                         <>
                          <img src={inputImage} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-white text-[10px] font-black uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full border border-white/10">Replace</p>
                          </div>
                         </>
                       ) : (
                         <>
                          <Plus className="text-gray-700 mb-2 group-hover:text-purple-500 transition-colors" />
                          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center px-4">{selectedTool.useTwoImages ? 'Inject Base Canvas' : 'Inject Base Neural Scan'}</p>
                         </>
                       )}
                       <input 
                        id="image-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, false)}
                       />
                     </div>
                   </div>

                   {selectedTool.useTwoImages && (
                     <div className="space-y-2">
                       <Label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Face Source Image</Label>
                       <div 
                        onClick={() => document.getElementById('face-upload')?.click()}
                        className="relative w-full aspect-video bg-black border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-all overflow-hidden group"
                       >
                         {faceSourceImage ? (
                           <>
                            <img src={faceSourceImage} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <p className="text-white text-[10px] font-black uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full border border-white/10">Replace</p>
                            </div>
                           </>
                         ) : (
                           <>
                            <Plus className="text-gray-700 mb-2 group-hover:text-purple-500 transition-colors" />
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center px-4">Inject Identity Source</p>
                           </>
                         )}
                         <input 
                          id="face-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageUpload(e, true)}
                         />
                       </div>
                     </div>
                   )}
                 </div>
               )}

               <div className="space-y-2">
                 <Label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">The Prompt</Label>
                 <textarea 
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none min-h-[120px] resize-none"
                   placeholder="Describe your vision in detail..."
                 />
               </div>

               {error && (
                 <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                   <p className="text-red-500 text-xs font-bold uppercase tracking-widest text-center">{error}</p>
                 </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label className="text-[10px] text-gray-500 uppercase font-black">Quality</Label>
                     <select 
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl h-10 px-3 text-sm text-white focus:outline-none"
                     >
                        <option>Standard</option>
                        <option>High</option>
                        <option>Studio 4K</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] text-gray-500 uppercase font-black">Aspect Ratio</Label>
                     <select 
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl h-10 px-3 text-sm text-white focus:outline-none"
                     >
                        <option>1:1 (Square)</option>
                        <option>16:9 (Cinema)</option>
                        <option>9:16 (Story)</option>
                     </select>
                  </div>
               </div>

               <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full h-16 bg-purple-600 hover:bg-purple-500 text-white font-black text-lg rounded-2xl purple-glow transition-all"
               >
                 {isGenerating ? (
                   <div className="flex items-center gap-3">
                     <RefreshCw className="animate-spin" /> SUMMONING VISION...
                   </div>
                 ) : 'GENERATE MASTERPIECE'}
               </Button>
            </Card>

            {resultImage && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-6"
              >
                <div className="relative rounded-[2rem] overflow-hidden border border-white/20 glass shadow-2xl">
                   <img src={resultImage} alt="Result" className="w-full aspect-square object-cover" />
                </div>
                <div className="flex gap-4">
                  <DownloadMenu 
                    url={resultImage} 
                    type="image" 
                    className="flex-1 h-14 bg-white text-black hover:bg-white/90"
                    filename={`vaikunthai-image-${Date.now()}.png`}
                  />
                  <Button variant="outline" className="h-14 w-14 border-white/10 bg-white/5 rounded-2xl flex items-center justify-center p-0">
                     <RefreshCw size={24} className="text-white" />
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
      <div className="h-24" />
    </Layout>
  );
}
