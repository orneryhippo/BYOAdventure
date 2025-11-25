import React from 'react';
import { Backpack, Scroll, MessageSquare, X } from 'lucide-react';

interface SidebarProps {
  inventory: string[];
  quests: string[];
  isChatOpen: boolean;
  toggleChat: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  inventory, 
  quests, 
  isChatOpen, 
  toggleChat,
  className 
}) => {
  return (
    <div className={`flex flex-col h-full bg-mythic-800 border-r border-mythic-700 text-mythic-100 ${className}`}>
      <div className="p-6 border-b border-mythic-700">
        <h1 className="text-2xl font-bold text-mythic-accent font-serif tracking-wider">MythicPaths</h1>
        <p className="text-xs text-mythic-500 mt-1 uppercase tracking-widest">Adventure Engine</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Inventory Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-mythic-400">
            <Backpack size={20} />
            <h2 className="text-sm font-bold uppercase tracking-wide">Inventory</h2>
          </div>
          {inventory.length === 0 ? (
            <p className="text-sm text-mythic-600 italic pl-7">Your bag is empty.</p>
          ) : (
            <ul className="space-y-2 pl-7">
              {inventory.map((item, idx) => (
                <li key={idx} className="text-sm bg-mythic-900/50 p-2 rounded border border-mythic-700/50 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-mythic-accent"></span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quests Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-mythic-400">
            <Scroll size={20} />
            <h2 className="text-sm font-bold uppercase tracking-wide">Current Quests</h2>
          </div>
          {quests.length === 0 ? (
            <p className="text-sm text-mythic-600 italic pl-7">No active quests.</p>
          ) : (
            <ul className="space-y-2 pl-7">
              {quests.map((quest, idx) => (
                <li key={idx} className="text-sm bg-mythic-900/50 p-2 rounded border border-mythic-700/50">
                   <div className="flex items-start gap-2">
                    <span className="text-mythic-500 mt-1">◇</span>
                    <span>{quest}</span>
                   </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer / Chat Toggle */}
      <div className="p-4 border-t border-mythic-700 bg-mythic-900/30">
        <button 
          onClick={toggleChat}
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg transition-all duration-200 ${
            isChatOpen 
              ? 'bg-mythic-700 text-white' 
              : 'bg-mythic-accent text-mythic-900 hover:bg-yellow-500'
          } font-bold shadow-lg`}
        >
          {isChatOpen ? <><X size={18} /> Close Chat</> : <><MessageSquare size={18} /> Ask DM</>}
        </button>
      </div>
    </div>
  );
};