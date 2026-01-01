
import React from 'react';

interface LoadingAnimationProps {
  message?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  message = 'Пишем для вас волшебные строки, подождите...' 
}) => {
  return (
    <div className="my-auto text-center space-y-4 p-4 md:p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-md mx-auto w-full">
      <div className="flex flex-col items-center space-y-3 md:space-y-4">
        {/* Танцующие новогодние персонажи */}
        <div className="flex items-end justify-center gap-2 md:gap-3 h-16 md:h-20 overflow-hidden">
          {[
            { emoji: '🎅', delay: '0s', name: 'santa' },
            { emoji: '🎄', delay: '0.2s', name: 'tree' },
            { emoji: '⛄', delay: '0.4s', name: 'snowman' },
            { emoji: '🎁', delay: '0.6s', name: 'gift' },
            { emoji: '⭐', delay: '0.8s', name: 'star' },
          ].map((char, i) => (
            <div
              key={i}
              className="text-3xl md:text-4xl animate-bounce"
              style={{
                animationDelay: char.delay,
                animationDuration: '1s',
              }}
            >
              {char.emoji}
            </div>
          ))}
        </div>
        
        <p className="text-xl md:text-2xl text-blue-100 font-handwriting italic animate-pulse px-4">
          {message}
        </p>

        {/* Видео с танцующей лошадью */}
        <div className="flex justify-center pt-1">
          <div className="relative rounded-2xl overflow-hidden border-4 border-yellow-500 shadow-[0_8px_20px_rgba(234,179,8,0.4)] transform transition-all hover:scale-105 hover:shadow-[0_12px_30px_rgba(234,179,8,0.6)] w-40 md:w-48 aspect-square">
            {/* Декоративная внутренняя рамка */}
            <div className="absolute inset-0 border-2 border-white/20 pointer-events-none z-10 rounded-xl"></div>
            
            <video
              src="/videos/horse_dance.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;

