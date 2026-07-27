
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, SparklesIcon, CheckIcon } from './icons';

interface CreatorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, size: any, ratio: string) => void;
}

const SIZES = ["1K", "2K", "4K"];
// Fixed: Restricted RATIOS to only those supported by nano banana series models
const RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"];

const CreatorSheet: React.FC<CreatorSheetProps> = ({ isOpen, onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState("1K");
  const [ratio, setRatio] = useState("1:1");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center px-4 pb-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            className="relative w-full max-w-lg ios-glass rounded-[2.5rem] p-6 space-y-6 ios-shadow"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Nano Banana Pro Creator</h2>
              <button onClick={onClose} className="p-2 bg-gray-200 rounded-full"><XIcon className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Prompt</label>
              <textarea 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="A high-fashion shot of a futuristic streetwear collection..."
                className="w-full h-32 bg-gray-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Output Size</label>
                <div className="flex bg-gray-200 p-1 rounded-xl">
                  {SIZES.map(s => (
                    <button 
                      key={s} 
                      onClick={() => setSize(s)}
                      className={`flex-grow py-1.5 text-xs font-bold rounded-lg transition-all ${size === s ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Aspect Ratio</label>
                <div className="grid grid-cols-5 gap-1">
                  {RATIOS.map(r => (
                    <button 
                      key={r} 
                      onClick={() => setRatio(r)}
                      className={`py-1 text-[10px] font-bold border rounded-lg ${ratio === r ? 'bg-black text-white' : 'bg-white text-gray-400 border-gray-100'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => onGenerate(prompt, size, ratio)}
              disabled={!prompt.trim()}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold ios-shadow hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <SparklesIcon className="w-5 h-5" />
              Generate Pro Image
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreatorSheet;
