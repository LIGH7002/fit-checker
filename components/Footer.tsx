
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface FooterProps {
  isOnDressingScreen?: boolean;
}

const Footer: React.FC<FooterProps> = ({ isOnDressingScreen = false }) => {
  return (
    <footer className={`fixed bottom-0 left-0 right-0 ios-glass border-t border-gray-200/60 p-3 z-50 ${isOnDressingScreen ? 'hidden sm:block' : ''}`}>
      <div className="mx-auto flex items-center justify-center text-[10px] uppercase tracking-widest text-gray-500 font-bold max-w-7xl px-4">
        <p>Created by ishaan</p>
      </div>
    </footer>
  );
};

export default Footer;
