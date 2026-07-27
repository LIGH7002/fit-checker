
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, SendIcon, SparklesIcon } from './icons';
import { chatWithGemini } from '../services/geminiService';
import Spinner from './Spinner';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: "Hey! I'm your AI fashion assistant. Ask me anything about your outfits!" }
  ]);
  const [input, setInput] = useState('');
  const [isFastMode, setIsFastMode] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const reply = await chatWithGemini(userMsg, isFastMode);
      setMessages(prev => [...prev, { role: 'bot', text: reply || "I'm not sure about that." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I ran into an error. Try again!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 right-6 w-full max-w-sm h-[500px] ios-glass ios-shadow rounded-[2rem] z-[60] flex flex-col overflow-hidden"
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="font-bold text-sm">AI Assistant</h3>
              <div className="flex items-center gap-2 mt-1">
                <button 
                  onClick={() => setIsFastMode(!isFastMode)}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${isFastMode ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}
                >
                  {isFastMode ? '⚡ Flash Lite' : '💎 Pro Mode'}
                </button>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><XIcon className="w-4 h-4" /></button>
          </div>

          <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4 no-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-black rounded-bl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && <Spinner />}
          </div>

          <div className="p-4 border-t bg-white/50">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask Gemini..."
                className="w-full bg-gray-100 rounded-full py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleSend} className="absolute right-2 p-2 text-blue-600"><SendIcon className="w-5 h-5" /></button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatBot;
