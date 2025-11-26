'use client';

import { useEffect, useState } from 'react';

/**
 * タイピングアニメーション用フック
 */
export function useTypewriter(
  text: string,
  options?: {
    speed?: number;
    delay?: number;
  }
) {
  const { speed = 20, delay = 0 } = options || {};
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);

    const startDelay = setTimeout(() => {
      let currentIndex = 0;

      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startDelay);
  }, [text, speed, delay]);

  return { displayText, isComplete };
}
