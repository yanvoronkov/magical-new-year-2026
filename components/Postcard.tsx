
import React, { useState, useEffect, useRef } from 'react';

interface PostcardProps {
  text: string;
  duration: number; // in seconds
  startTrigger: boolean;
  onFinished: () => void;
}

const Postcard: React.FC<PostcardProps> = ({ text, duration, startTrigger, onFinished }) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!startTrigger) return;
    
    setIsTyping(true);
    // Calculate typing speed based on audio duration
    // We want the typing to finish slightly before the voice ends for a natural feel
    const typingDurationMs = (duration * 0.9) * 1000;
    const intervalTime = typingDurationMs / text.length;

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayText(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        setIsTyping(false);
        clearInterval(interval);
        onFinished();
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [text, duration, startTrigger, onFinished]);

  return (
    <div className="relative w-full max-w-2xl min-h-[450px] h-auto bg-[#fdf5e6] rounded-xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] p-8 md:p-12 overflow-hidden border-8 border-[#c41e3a] transform transition-all duration-700 flex flex-col">
      {/* Texture overlay for paper feel */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
      
      {/* Postcard Background Elements */}
      <div className="absolute top-4 right-4 w-20 h-24 border-2 border-dashed border-gray-400 opacity-20"></div>
      <div className="absolute top-8 right-8 w-12 h-16 bg-[#c41e3a] opacity-5 rounded-sm flex items-center justify-center text-[#c41e3a] text-xs font-bold">2026</div>
      
      {/* Decorative Tree */}
      <div className="absolute bottom-6 right-6 opacity-30 pointer-events-none scale-125">
        <svg width="100" height="100" viewBox="0 0 100 100">
           <path d="M50 10 L80 50 L20 50 Z" fill="#1b4d3e" />
           <path d="M50 30 L90 70 L10 70 Z" fill="#1b4d3e" />
           <path d="M50 50 L100 95 L0 95 Z" fill="#1b4d3e" />
           <rect x="45" y="95" width="10" height="5" fill="#3e2723" />
           <circle cx="50" cy="10" r="3" fill="#ffd700" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col flex-grow">
        <h2 className="text-4xl md:text-5xl font-elegant text-[#c41e3a] mb-8 text-center drop-shadow-sm">
          С Новым 2026 Годом!
        </h2>
        
        <div className="flex-grow mb-12">
          <p className="text-2xl md:text-3xl font-handwriting text-blue-900 leading-relaxed ink-bleed italic whitespace-pre-wrap">
            {displayText}
            {isTyping && <span className="ml-1 border-r-2 border-blue-900 animate-pulse"></span>}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-300 text-right font-elegant text-2xl text-[#c41e3a]">
          Ваш магический Gemini AI ✨
        </div>
      </div>
    </div>
  );
};

export default Postcard;


