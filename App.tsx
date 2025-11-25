import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StoryDisplay } from './components/StoryDisplay';
import { ChatBot } from './components/ChatBot';
import { generateStoryStep, generateSceneImage } from './services/geminiService';
import { StoryState, GameHistoryItem, ImageSize } from './types';
import { Play } from 'lucide-react';

export default function App() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  
  // Game State
  const [storyState, setStoryState] = useState<StoryState>({
    narrative: "",
    options: [],
    inventory: [],
    quests: [],
    imagePrompt: ""
  });
  
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  
  // UI State
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    setStarted(true);
    try {
      // Initial Step
      const newState = await generateStoryStep([], "Begin Adventure", [], []);
      setStoryState(newState);
      setHistory([{ role: 'model', text: newState.narrative }]);
      
      // Trigger Image Generation
      setImageLoading(true);
      generateSceneImage(newState.imagePrompt, imageSize).then(img => {
        setCurrentImage(img);
        setImageLoading(false);
      });
      
    } catch (error) {
      console.error(error);
      setStoryState(prev => ({ ...prev, narrative: "The mists of creation failed to coalesce. Please refresh to try again." }));
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = async (choice: string) => {
    setLoading(true);
    
    // Optimistic UI update or wait? Waiting is safer for state consistency in a turn-based game.
    const newHistory: GameHistoryItem[] = [
      ...history,
      { role: 'user', text: choice }
    ];

    try {
      const newState = await generateStoryStep(
        newHistory, 
        choice, 
        storyState.inventory, 
        storyState.quests
      );
      
      setStoryState(newState);
      setHistory([...newHistory, { role: 'model', text: newState.narrative }]);
      
      // Trigger Image Generation in parallel with text read time
      setImageLoading(true);
      generateSceneImage(newState.imagePrompt, imageSize).then(img => {
        setCurrentImage(img);
        setImageLoading(false);
      });

    } catch (error) {
      console.error(error);
      // Allow retry or show error
    } finally {
      setLoading(false);
    }
  };

  const handleImageSizeChange = (newSize: ImageSize) => {
    setImageSize(newSize);
    // Optionally regenerate current image with new size if user switches? 
    // Let's keep it simple: next image will use new size, or user can assume setting is for future.
    // However, to be "world class", we should regenerate immediately if they switch.
    if (storyState.imagePrompt && !imageLoading) {
      setImageLoading(true);
      generateSceneImage(storyState.imagePrompt, newSize).then(img => {
        setCurrentImage(img);
        setImageLoading(false);
      });
    }
  };

  if (!started) {
    return (
      <div className="h-screen w-full bg-mythic-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-serif font-bold text-mythic-100 tracking-tighter">MythicPaths</h1>
            <p className="text-mythic-400">An Infinite Adventure Engine</p>
          </div>
          
          <div className="bg-mythic-800 p-6 rounded-lg border border-mythic-700 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <p className="text-mythic-300 mb-6">
              Enter a world that builds itself around your choices. 
              Track your inventory, complete quests, and witness every step in high-resolution AI art.
            </p>
            <button 
              onClick={handleStart}
              disabled={loading}
              className="w-full py-4 bg-mythic-accent hover:bg-yellow-500 text-mythic-900 font-bold text-lg rounded shadow-lg flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? 'Manifesting World...' : <><Play size={24} fill="currentColor" /> Begin Journey</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-mythic-900 text-mythic-100 font-sans">
      {/* Sidebar - Hidden on mobile unless toggled? For this layout we'll keep it persistent on desktop, hidden on mobile */}
      <div className="hidden md:block w-64 shrink-0 h-full relative z-30">
        <Sidebar 
          inventory={storyState.inventory} 
          quests={storyState.quests}
          isChatOpen={isChatOpen}
          toggleChat={() => setIsChatOpen(!isChatOpen)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Mobile Header / Sidebar Toggle could go here */}
        
        <div className="flex-1 overflow-hidden relative">
           <StoryDisplay 
             imageSrc={currentImage}
             narrative={storyState.narrative}
             isImageLoading={imageLoading}
             imageSize={imageSize}
             onImageSizeChange={handleImageSizeChange}
           />
           
           {/* Chat Overlay */}
           <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>

        {/* Action Area (Bottom Sticky) */}
        <div className="shrink-0 bg-mythic-800 border-t border-mythic-700 p-4 md:p-6 z-20">
          <div className="max-w-4xl mx-auto">
             {loading ? (
               <div className="text-center py-4 text-mythic-400 animate-pulse">
                 Fating the threads of destiny...
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {storyState.options.map((option, idx) => (
                   <button
                     key={idx}
                     onClick={() => handleChoice(option)}
                     className="p-4 text-left text-sm md:text-base bg-mythic-900 hover:bg-mythic-700 border border-mythic-600 hover:border-mythic-accent rounded-lg transition-all duration-200 shadow-sm group"
                   >
                     <span className="font-bold text-mythic-500 group-hover:text-mythic-accent mr-2">{idx + 1}.</span>
                     {option}
                   </button>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}