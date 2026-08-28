import React from 'react';
import { motion } from 'framer-motion';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  animationFrom?: { opacity: number; y: number };
  animationTo?: { opacity: number; y: number };
  easing?: [number, number, number, number];
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right';
  onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 30,
  animationFrom = { opacity: 0, y: 25 },
  animationTo = { opacity: 1, y: 0 },
  textAlign = 'center',
}) => {
  const words = text.split(' ');

  return (
    <div
      className={`inline-flex flex-wrap ${
        textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : 'justify-start'
      } ${className}`}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap mr-2.5">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              initial={animationFrom}
              animate={animationTo}
              transition={{
                duration: 0.5,
                delay: (wordIndex * 6 + charIndex) * (delay / 1000),
                ease: [0.2, 0.65, 0.3, 0.9],
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </div>
  );
};
