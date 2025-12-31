
import React from 'react';

interface LoadingAnimationProps {
  message?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  message = 'Пишем для вас волшебные строки...' 
}) => {
  return (
    <div className="my-auto text-center space-y-8 p-12 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
      <div className="flex flex-col items-center space-y-6">
        {/* Танцующие новогодние персонажи */}
        <div className="flex items-end justify-center gap-4 h-32">
          {[
            { emoji: '🎅', delay: '0s', name: 'santa' },
            { emoji: '🎄', delay: '0.2s', name: 'tree' },
            { emoji: '⛄', delay: '0.4s', name: 'snowman' },
            { emoji: '🎁', delay: '0.6s', name: 'gift' },
            { emoji: '⭐', delay: '0.8s', name: 'star' },
          ].map((char, i) => (
            <div
              key={i}
              className="text-6xl animate-bounce"
              style={{
                animationDelay: char.delay,
                animationDuration: '1s',
              }}
            >
              {char.emoji}
            </div>
          ))}
        </div>
        <p className="text-3xl text-blue-100 font-handwriting italic animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingAnimation;

