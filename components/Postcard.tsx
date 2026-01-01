
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
    
    console.log('📝  Начинаем печать текста:', { textLength: text.length, duration });
    
    setIsTyping(true);
    // Calculate typing speed based on audio duration
    // We want the typing to finish slightly before the voice ends for a natural feel
    const typingDurationMs = (duration * 0.9) * 1000;
    const intervalTime = typingDurationMs / text.length;
    
    console.log(`⏱️ Длительность печати: ${typingDurationMs}ms, интервал: ${intervalTime}ms`);

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayText(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        setIsTyping(false);
        clearInterval(interval);
        console.log('✅ Печать завершена');
        onFinished();
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [text, duration, startTrigger, onFinished]);

  return (
    <div className="relative w-full max-w-2xl min-h-[450px] h-auto bg-[#fdf5e6] rounded-xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] p-4 md:p-12 overflow-hidden border-8 border-[#c41e3a] transform transition-all duration-700 flex flex-col">
      {/* Texture overlay for paper feel */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
      
      {/* Марка-стикер в правом верхнем углу (повернутая) */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 w-16 h-20 md:w-20 md:h-24 transform rotate-12 z-20">
        <img 
          src="/stikers/sticker1.png" 
          alt="Новогодняя марка" 
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>
      
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
        {/* Заголовок - с отступом справа чтобы не накладывался на марку */}
        <h2 className="text-3xl md:text-5xl font-elegant text-[#c41e3a] mb-4 md:mb-8 text-center drop-shadow-sm pr-16 md:pr-0">
          С Новым 2026 Годом!
        </h2>
        
        {/* Текст поздравления с line-height 1.2 */}
        <div className="flex-grow mb-8 md:mb-12">
          <p className="text-xl md:text-3xl font-handwriting text-blue-900 ink-bleed italic whitespace-pre-wrap" style={{ lineHeight: '1.2' }}>
            {displayText}
            {isTyping && <span className="ml-1 border-r-2 border-blue-900 animate-pulse"></span>}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-300 text-right font-elegant text-2xl text-[#c41e3a]">
         
        </div>
      </div>
    </div>
  );
};

export default Postcard;
