import React, { useRef, useEffect } from 'react';
import { ImageSize } from '../types';

interface StoryDisplayProps {
  imageSrc: string | null;
  narrative: string;
  isImageLoading: boolean;
  imageSize: ImageSize;
  onImageSizeChange: (size: ImageSize) => void;
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({
  imageSrc,
  narrative,
  isImageLoading,
  imageSize,
  onImageSizeChange
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of narrative when it changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [narrative]);

  return (
    <div className="flex flex-col h-full bg-mythic-900 relative overflow-hidden">
      {/* Image Area */}
      <div className="relative w-full shrink-0 bg-black flex items-center justify-center overflow-hidden border-b-4 border-mythic-800 shadow-2xl transition-all duration-500 ease-in-out" style={{ minHeight: '300px', maxHeight: '50vh' }}>
        
        {/* Image Size Controls */}
        <div className="absolute top-4 right-4 z-20 flex bg-black/60 backdrop-blur-md rounded-lg p-1 border border-white/10">
          {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
            <button
              key={size}
              onClick={() => onImageSizeChange(size)}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                imageSize === size 
                  ? 'bg-mythic-accent text-mythic-900 shadow-sm' 
                  : 'text-mythic-300 hover:bg-white/10'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {isImageLoading ? (
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-16 h-16 border-4 border-mythic-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-mythic-accent text-sm tracking-widest uppercase">Conjuring Vision...</p>
          </div>
        ) : imageSrc ? (
          <img 
            src={imageSrc} 
            alt="Scene illustration" 
            className="w-full h-full object-cover animate-in fade-in duration-1000"
          />
        ) : (
          <div className="text-mythic-600 italic">No image available</div>
        )}
        
        {/* Gradient Overlay for Text Blend */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-mythic-900 to-transparent pointer-events-none"></div>
      </div>

      {/* Text Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 md:p-12 space-y-6 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-invert prose-lg md:prose-xl font-serif text-mythic-300 leading-relaxed">
             {narrative.split('\n').map((paragraph, idx) => (
               <p key={idx} className="mb-4 text-shadow-sm">{paragraph}</p>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};