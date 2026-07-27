
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ModelTraits } from '../types';
import { SettingsIcon } from './icons';

interface ModelCustomizerProps {
  traits: ModelTraits;
  onChange: (traits: ModelTraits) => void;
  isLoading: boolean;
}

const SKIN_TONES = ['Fair', 'Medium', 'Olive', 'Tan', 'Deep'] as const;
const HAIR_COLORS = ['Black', 'Brown', 'Blonde', 'Red', 'Platinum'] as const;
const BODY_TYPES = ['Lean', 'Athletic', 'Average', 'Curvy'] as const;

const ModelCustomizer: React.FC<ModelCustomizerProps> = ({ traits, onChange, isLoading }) => {
  const updateTrait = (key: keyof ModelTraits, value: string) => {
    if (isLoading) return;
    onChange({ ...traits, [key]: value });
  };

  const SegmentedControl = ({ 
    label, 
    options, 
    currentValue, 
    onChange 
  }: { 
    label: string, 
    options: readonly string[], 
    currentValue: string, 
    onChange: (val: any) => void 
  }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider ml-1">{label}</label>
      <div className="flex bg-gray-100/80 p-1 rounded-xl overflow-x-auto no-scrollbar">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            disabled={isLoading}
            className={`flex-grow whitespace-nowrap px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
              currentValue === opt 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-400/50 pb-2">
        <SettingsIcon className="w-4 h-4 text-gray-500" />
        <h2 className="text-xl font-serif tracking-wider text-gray-800">Model Details</h2>
      </div>
      
      <div className="space-y-5">
        <SegmentedControl 
          label="Skin Tone" 
          options={SKIN_TONES} 
          currentValue={traits.skinTone} 
          onChange={(v) => updateTrait('skinTone', v)} 
        />
        <SegmentedControl 
          label="Hair Color" 
          options={HAIR_COLORS} 
          currentValue={traits.hairColor} 
          onChange={(v) => updateTrait('hairColor', v)} 
        />
        <SegmentedControl 
          label="Body Type" 
          options={BODY_TYPES} 
          currentValue={traits.bodyType} 
          onChange={(v) => updateTrait('bodyType', v)} 
        />
      </div>
      
      {isLoading && (
        <p className="text-[10px] text-center italic text-blue-500 animate-pulse font-medium">
          Applying identity changes...
        </p>
      )}
    </div>
  );
};

export default ModelCustomizer;
