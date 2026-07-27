
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { OutfitLayer } from '../types';
import { Trash2Icon, ShirtIcon } from './icons';

interface OutfitStackProps {
  outfitHistory: OutfitLayer[];
  onRemoveLastGarment: () => void;
}

const OutfitStack: React.FC<OutfitStackProps> = ({ outfitHistory, onRemoveLastGarment }) => {
  const currentLayer = outfitHistory[outfitHistory.length - 1];
  const hasGarment = currentLayer && currentLayer.garment;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 border-b border-gray-400/50 pb-2 mb-4">
        <ShirtIcon className="w-4 h-4 text-gray-500" />
        <h2 className="text-xl font-serif tracking-wider text-gray-800">Current Look</h2>
      </div>
      
      <div className="space-y-3">
        {hasGarment ? (
          <div className="flex items-center justify-between bg-white/50 p-3 rounded-2xl animate-fade-in border border-gray-200/80 ios-shadow group">
            <div className="flex items-center overflow-hidden">
                <img 
                    src={currentLayer.garment!.url} 
                    alt={currentLayer.garment!.name} 
                    className="flex-shrink-0 w-14 h-14 object-cover rounded-xl mr-3 shadow-sm border border-white" 
                />
                <div className="flex flex-col overflow-hidden">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selected Item</span>
                    <span className="font-bold text-gray-800 truncate text-sm" title={currentLayer.garment!.name}>
                    {currentLayer.garment!.name}
                    </span>
                </div>
            </div>
            <button
                onClick={onRemoveLastGarment}
                className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-all p-2 rounded-full hover:bg-red-50"
                aria-label="Remove garment"
            >
                <Trash2Icon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <ShirtIcon className="w-8 h-8 text-gray-200 mb-2" />
            <p className="text-[11px] text-gray-400 text-center px-6 italic font-medium">
                No clothing applied. Choose a garment from the wardrobe below.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutfitStack;
