import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Message } from '../types';
import { chatWithDungeonMaster } from '../services/geminiService';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Greetings, adventurer. I am the Dungeon Master. Seek my guidance if you are lost, but tread carefully." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // We pass the conversation history minus the very latest user message (handled by the service logic usually, 
      // but here we pass the full context including previous turns)
      const responseText = await chatWithDungeonMaster(messages, input);
      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "A magical interference disrupts my voice." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-96 bg-mythic-900/95 backdrop-blur-xl border-l border-mythic-700 shadow-2xl z-40 flex flex-col transition-transform duration-300 transform translate-x-0">
      <div className="p-4 border-b border-mythic-700 bg-mythic-800/50 flex justify-between items-center">
        <h3 className="font-bold text-mythic-accent flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Dungeon Master
        </h3>
        <button onClick={onClose} className="text-mythic-400 hover:text-white">&times;</button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-mythic-600 text-white rounded-tr-none' 
                : 'bg-mythic-800 text-mythic-100 border border-mythic-700 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-mythic-800 p-3 rounded-lg rounded-tl-none border border-mythic-700 flex gap-1">
              <span className="w-2 h-2 bg-mythic-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-mythic-500 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-mythic-500 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-mythic-700 bg-mythic-800/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask the DM..."
            className="flex-1 bg-mythic-900 border border-mythic-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-mythic-accent"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-mythic-accent text-mythic-900 p-2 rounded-md hover:bg-yellow-500 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};