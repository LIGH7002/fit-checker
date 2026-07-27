
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface WardrobeItem {
  id: string;
  name: string;
  url: string;
}

export interface ModelTraits {
  skinTone: 'Fair' | 'Medium' | 'Olive' | 'Tan' | 'Deep';
  hairColor: 'Black' | 'Brown' | 'Blonde' | 'Red' | 'Platinum';
  bodyType: 'Lean' | 'Athletic' | 'Average' | 'Curvy';
}

export interface OutfitLayer {
  garment: WardrobeItem | null;
  poseImages: Record<string, string>;
}

export interface SavedOutfit {
  id: string;
  name: string;
  thumbnailUrl: string;
  outfitHistory: OutfitLayer[];
  currentPoseIndex: number;
  modelImageUrl: string | null;
  timestamp: number;
}
