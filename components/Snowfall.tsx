
import React, { useMemo } from 'react';

const Snowfall: React.FC = () => {
  const snowflakes = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${5 + Math.random() * 10}s`,
      animationDelay: `${Math.random() * 5}s`,
      opacity: 0.4 + Math.random() * 0.6,
      size: `${10 + Math.random() * 15}px`,
    }));
  }, []);

  return (
    <>
      {snowflakes.map((s) => (
        <div
          key={s.id}
          className="snowflake"
          style={{
            left: s.left,
            animationDuration: s.animationDuration,
            animationDelay: s.animationDelay,
            opacity: s.opacity,
            fontSize: s.size,
          }}
        >
          ❄
        </div>
      ))}
    </>
  );
};

export default Snowfall;
