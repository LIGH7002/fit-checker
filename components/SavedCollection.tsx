
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { SavedOutfit } from '../types';
import { Trash2Icon, BookmarkIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';

interface SavedCollectionProps {
  outfits: SavedOutfit[];
  onLoad: (outfit: SavedOutfit) => void;
  onDelete: (id: string) => void;
}

const SavedCollection: React.FC<SavedCollectionProps> = ({ outfits, onLoad, onDelete }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-400/50 pb-2 mb-3">
        <h2 className="text-xl font-serif tracking-wider text-gray-800">My Collection</h2>
        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full font-bold text-gray-500">
            {outfits.length}
        </span>
      </div>
      
      {outfits.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <BookmarkIcon className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-xs text-gray-400 text-center px-4 italic">
                Save your favorite looks using the bookmark icon on the canvas.
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
                {outfits.map((outfit) => (
                    <motion.div
                        key={outfit.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group relative aspect-[2/3] rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white"
                    >
                        <img 
                            src={outfit.thumbnailUrl} 
                            alt={outfit.name} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                            <button
                                onClick={() => onLoad(outfit)}
                                className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-full shadow-lg hover:bg-indigo-50 active:scale-95 transition-all"
                            >
                                Load Look
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(outfit.id);
                                }}
                                className="p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 active:scale-90 transition-all"
                                aria-label="Delete outfit"
                            >
                                <Trash2Icon className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        
                        {/* Label */}
                        <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-white/90 backdrop-blur-sm border-t border-gray-100">
                            <p className="text-[10px] font-bold text-gray-700 truncate text-center">
                                {outfit.name}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default SavedCollection;
