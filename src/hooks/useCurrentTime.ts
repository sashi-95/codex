'use client';

/**
 * useCurrentTime
 * 1 秒ごとに更新する現在時刻を返す。killzone 判定のリアクティブ化に使用。
 */

import { useState, useEffect, useRef } from 'react';

export function useCurrentTime(): Date {
  const [now, setNow] = useState(() => new Date());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const id = setInterval(() => {
      if (mountedRef.current) {
        setNow(new Date());
      }
    }, 1000);

    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, []);

  return now;
}
