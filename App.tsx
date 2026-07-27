
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StartScreen from './components/StartScreen';
import Canvas from './components/Canvas';
import WardrobePanel from './components/WardrobeModal';
import OutfitStack from './components/OutfitStack';
import SavedCollection from './components/SavedCollection';
import ModelCustomizer from './components/ModelCustomizer';
import ChatBot from './components/ChatBot';
import CreatorSheet from './components/CreatorSheet';
import { 
  generateVirtualTryOnImage, 
  editImageWithPrompt, 
  upscaleImage, 
  generateImageWithPro,
  customizeModelImage
} from './services/geminiService';
import { OutfitLayer, WardrobeItem, SavedOutfit, ModelTraits } from './types';
import { ChevronDownIcon, ChevronUpIcon, MessageCircleIcon, SettingsIcon } from './components/icons';
import { defaultWardrobe } from './wardrobe';
import Footer from './components/Footer';
import { getFriendlyErrorMessage } from './lib/utils';
import Spinner from './components/Spinner';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const POSE_INSTRUCTIONS = [
  "Full frontal view, hands on hips",
  "Slightly turned, 3/4 view",
  "Side profile view",
  "Jumping in the air, mid-action shot",
  "Walking towards camera",
  "Leaning against a wall",
];

const DEFAULT_TRAITS: ModelTraits = {
  skinTone: 'Medium',
  hairColor: 'Brown',
  bodyType: 'Average'
};

const App: React.FC = () => {
  const [modelImageUrl, setModelImageUrl] = useState<string | null>(null);
  const [outfitHistory, setOutfitHistory] = useState<OutfitLayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [traits, setTraits] = useState<ModelTraits>(DEFAULT_TRAITS);

  useEffect(() => {
    const stored = localStorage.getItem('saved_tryon_outfits');
    if (stored) setSavedOutfits(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('saved_tryon_outfits', JSON.stringify(savedOutfits));
  }, [savedOutfits]);

  const activeOutfitLayers = useMemo(() => 
    outfitHistory.slice(-1), // Single-garment system: only keep the latest
    [outfitHistory]
  );
  
  const displayImageUrl = useMemo(() => {
    if (outfitHistory.length === 0) return modelImageUrl;
    const currentLayer = outfitHistory[outfitHistory.length - 1];
    if (!currentLayer) return modelImageUrl;
    return currentLayer.poseImages[POSE_INSTRUCTIONS[currentPoseIndex]] ?? Object.values(currentLayer.poseImages)[0];
  }, [outfitHistory, currentPoseIndex, modelImageUrl]);

  const handleModelFinalized = (url: string) => {
    setModelImageUrl(url);
    // When a model is finalized, reset dressing to just the model
    setOutfitHistory([{ garment: null, poseImages: { [POSE_INSTRUCTIONS[0]]: url } }]);
  };

  const handleStartOver = () => {
    setModelImageUrl(null);
    setOutfitHistory([]);
    setIsLoading(false);
    setError(null);
    setTraits(DEFAULT_TRAITS);
  };

  const handleCustomizeTraits = useCallback(async (newTraits: ModelTraits) => {
    if (!modelImageUrl || isLoading) return;
    setTraits(newTraits);
    setIsLoading(true);
    setLoadingMessage("Refining model identity...");
    try {
      const newUrl = await customizeModelImage(modelImageUrl, newTraits);
      setModelImageUrl(newUrl);
      // Update base layer of history
      setOutfitHistory(prev => {
        const history = [...prev];
        if (history.length > 0) {
          history[0] = { ...history[0], poseImages: { ...history[0].poseImages, [POSE_INSTRUCTIONS[currentPoseIndex]]: newUrl } };
        }
        return history;
      });
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "Customization failed"));
    } finally {
      setIsLoading(false);
    }
  }, [modelImageUrl, isLoading, currentPoseIndex]);

  const handleImageEdit = useCallback(async (prompt: string) => {
    if (!displayImageUrl || isLoading) return;
    setIsLoading(true);
    setLoadingMessage("Applying magic...");
    try {
      const newUrl = await editImageWithPrompt(displayImageUrl, prompt);
      const newLayer: OutfitLayer = { 
        garment: { id: `magic-${Date.now()}`, name: "Remix", url: newUrl }, 
        poseImages: { [POSE_INSTRUCTIONS[currentPoseIndex]]: newUrl } 
      };
      // Single Look: Replace garment
      setOutfitHistory(prev => [prev[0], newLayer]);
    } catch (err) { setError(getFriendlyErrorMessage(err, "Magic failed")); }
    finally { setIsLoading(false); }
  }, [displayImageUrl, isLoading, currentPoseIndex]);

  const handleUpscale = useCallback(async () => {
    if (!displayImageUrl || isLoading) return;
    setIsLoading(true);
    setLoadingMessage("Upscaling to 4K...");
    try {
      const newUrl = await upscaleImage(displayImageUrl);
      const newLayer: OutfitLayer = { 
        garment: { id: `upscale-${Date.now()}`, name: "4K High Fidelity", url: newUrl }, 
        poseImages: { [POSE_INSTRUCTIONS[currentPoseIndex]]: newUrl } 
      };
      setOutfitHistory(prev => [prev[0], newLayer]);
    } catch (err) { setError(getFriendlyErrorMessage(err, "Upscale failed")); }
    finally { setIsLoading(false); }
  }, [displayImageUrl, isLoading, currentPoseIndex]);

  const handleGeneratePro = useCallback(async (prompt: string, size: any, ratio: string) => {
    const hasKey = await window.aistudio?.hasSelectedApiKey();
    if (!hasKey) await window.aistudio?.openSelectKey();
    
    setIsLoading(true);
    setLoadingMessage(`Generating ${size} Image...`);
    try {
      const url = await generateImageWithPro(prompt, size, ratio);
      handleModelFinalized(url);
      setIsCreatorOpen(false);
    } catch (err: any) { 
        if (err?.message?.includes("Requested entity was not found")) {
            setError("Project not found. Please select a valid paid API key.");
            await window.aistudio?.openSelectKey();
        } else {
            setError(getFriendlyErrorMessage(err, "Pro Generation Failed"));
        }
    }
    finally { setIsLoading(false); }
  }, []);

  return (
    <div className="min-h-screen bg-[#f2f2f7]">
      <AnimatePresence mode="wait">
        {!modelImageUrl ? (
          <StartScreen key="start" onModelFinalized={handleModelFinalized} onOpenCreator={() => setIsCreatorOpen(true)} />
        ) : (
          <div key="main" className="flex flex-col h-screen overflow-hidden">
            <main className="flex-grow relative flex flex-col md:flex-row">
              <div className="flex-grow relative">
                <Canvas 
                  displayImageUrl={displayImageUrl}
                  onStartOver={handleStartOver}
                  isLoading={isLoading}
                  loadingMessage={loadingMessage}
                  onEditImage={handleImageEdit}
                  onUpscale={handleUpscale}
                  onSaveOutfit={() => {}}
                  onSelectPose={(idx) => setCurrentPoseIndex(idx)}
                  currentPoseIndex={currentPoseIndex}
                  poseInstructions={POSE_INSTRUCTIONS}
                />
              </div>

              <aside className={`ios-glass ios-shadow fixed md:relative bottom-0 right-0 w-full md:w-96 h-2/3 md:h-full z-40 rounded-t-[2.5rem] md:rounded-none transition-transform duration-500 ease-in-out ${isSheetCollapsed ? 'translate-y-[calc(100%-4rem)]' : 'translate-y-0'} md:translate-y-0`}>
                <div className="h-1 bg-gray-300 w-12 mx-auto mt-4 rounded-full md:hidden cursor-pointer" onClick={() => setIsSheetCollapsed(!isSheetCollapsed)} />
                <div className="p-6 overflow-y-auto h-full space-y-8 no-scrollbar pb-32">
                  
                  <ModelCustomizer 
                    traits={traits} 
                    onChange={handleCustomizeTraits} 
                    isLoading={isLoading} 
                  />

                  <OutfitStack 
                    outfitHistory={activeOutfitLayers} 
                    onRemoveLastGarment={() => setOutfitHistory(prev => [prev[0]])} 
                  />

                  <SavedCollection 
                    outfits={savedOutfits} 
                    onLoad={(o) => { setModelImageUrl(o.modelImageUrl); setOutfitHistory(o.outfitHistory); }} 
                    onDelete={(id) => setSavedOutfits(s => s.filter(x => x.id !== id))} 
                  />

                  <WardrobePanel 
                    wardrobe={defaultWardrobe} 
                    activeGarmentIds={activeOutfitLayers.map(l => l.garment?.id).filter(Boolean) as string[]}
                    isLoading={isLoading}
                    onGarmentSelect={async (f, info) => {
                      setIsLoading(true);
                      setLoadingMessage(`Trying on ${info.name}...`);
                      try {
                        const url = await generateVirtualTryOnImage(modelImageUrl!, f);
                        const newLayer: OutfitLayer = { garment: info, poseImages: { [POSE_INSTRUCTIONS[currentPoseIndex]]: url } };
                        // Single garment: Only keep base model and current selection
                        setOutfitHistory(prev => [prev[0], newLayer]);
                      } catch (err) { setError(getFriendlyErrorMessage(err, "Try-on failed")); }
                      finally { setIsLoading(false); }
                    }}
                  />
                </div>
              </aside>
            </main>
          </div>
        )}
      </AnimatePresence>

      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full ios-shadow flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50">
        <MessageCircleIcon />
      </button>

      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <CreatorSheet isOpen={isCreatorOpen} onClose={() => setIsCreatorOpen(false)} onGenerate={handleGeneratePro} />
      <Footer isOnDressingScreen={!!modelImageUrl} />
      
      {error && (
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="fixed top-6 left-1/2 -translate-x-1/2 ios-glass bg-red-50/90 border-red-200 p-4 rounded-2xl ios-shadow z-[100] max-w-sm"
        >
          <p className="text-red-700 text-sm font-bold">Error: {error}</p>
          <button onClick={() => setError(null)} className="mt-2 text-xs font-bold uppercase text-red-500 underline">Dismiss</button>
        </motion.div>
      )}
    </div>
  );
};

export default App;
