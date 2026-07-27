
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { RotateCcwIcon, ChevronLeftIcon, ChevronRightIcon, WandIcon, ShirtIcon, SparklesIcon, BookmarkIcon } from './icons';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';

interface CanvasProps {
  displayImageUrl: string | null;
  onStartOver: () => void;
  isLoading: boolean;
  loadingMessage: string;
  onSelectPose: (index: number) => void;
  poseInstructions: string[];
  currentPoseIndex: number;
  onEditImage: (prompt: string) => void;
  onUpscale: () => void;
  onSaveOutfit: () => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  displayImageUrl, onStartOver, isLoading, loadingMessage, onSelectPose, poseInstructions, currentPoseIndex, onEditImage, onUpscale, onSaveOutfit
}) => {
  const [editPrompt, setEditPrompt] = useState("");

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      {/* Top Floating Bar */}
      <div className="absolute top-6 left-6 right-6 z-30 flex items-center justify-between">
        <button onClick={onStartOver} className="ios-glass p-3 rounded-2xl ios-shadow"><RotateCcwIcon className="w-5 h-5" /></button>
        <div className="flex gap-2">
            <button onClick={onUpscale} className="ios-glass px-4 py-2 rounded-2xl ios-shadow font-bold text-sm flex items-center gap-2"><SparklesIcon className="w-4 h-4" /> 4K</button>
            <button onClick={onSaveOutfit} className="ios-glass p-3 rounded-2xl ios-shadow"><BookmarkIcon className="w-5 h-5 text-blue-600" /></button>
        </div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        {displayImageUrl ? (
          <img src={displayImageUrl} alt="Model" className="max-w-full max-h-[80vh] object-contain rounded-[2rem] ios-shadow animate-zoom-in" />
        ) : <Spinner />}
        
        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 ios-glass z-20 flex flex-col items-center justify-center rounded-[2rem]">
              <Spinner /><p className="mt-4 font-bold text-sm">{loadingMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Floating magic bar */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 space-y-4">
        <div className="ios-glass ios-shadow p-2 rounded-[2rem] flex items-center gap-2">
            <button onClick={() => onSelectPose((currentPoseIndex - 1 + poseInstructions.length) % poseInstructions.length)} className="p-3 bg-gray-100 rounded-full"><ChevronLeftIcon /></button>
            <span className="flex-grow text-center text-xs font-bold truncate">{poseInstructions[currentPoseIndex]}</span>
            <button onClick={() => onSelectPose((currentPoseIndex + 1) % poseInstructions.length)} className="p-3 bg-gray-100 rounded-full"><ChevronRightIcon /></button>
        </div>

        <div className="ios-glass ios-shadow p-2 rounded-[2.5rem] flex items-center pr-4">
            <input 
              type="text" 
              value={editPrompt} 
              onChange={e => setEditPrompt(e.target.value)}
              placeholder="Magic edit: 'Add retro filter'..." 
              className="flex-grow bg-transparent px-4 py-3 text-sm focus:outline-none"
            />
            <button onClick={() => { onEditImage(editPrompt); setEditPrompt(''); }} className="bg-blue-600 text-white p-3 rounded-full ios-shadow"><ShirtIcon className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
