'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * 数値カウントアップアニメーション用フック
 */
export function useCountUp(
  end: number,
  options?: {
    duration?: number;
    start?: number;
    decimals?: number;
  }
) {
  const { duration = 800, start = 0, decimals = 0 } = options || {};
  const [count, setCount] = useState(start);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    let cancelled = false;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const current = start + (end - start) * easeProgress;

      if (!cancelled) {
        setCount(Number(current.toFixed(decimals)));

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      }
    };

    // Reset and start animation
    startTimeRef.current = undefined;
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelled = true;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration, start, decimals]);

  return count;
}
