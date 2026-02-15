'use client';

/**
 * useMarketData
 * Mock モードで 1 秒ごとに価格を生成。
 * NEXT_PUBLIC_WS_URL / VITE_WS_URL が設定されていれば WebSocket 接続に切り替え。
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { MarketTick } from '@/types/trading';

/* ── Base Prices ── */

const BASE_PRICES: Record<string, { base: number; spread: number }> = {
  'NQ1!': { base: 18260, spread: 15 },
  'ES1!': { base: 5120, spread: 5 },
  BTC: { base: 97500, spread: 250 },
  XAU: { base: 2340, spread: 8 },
  DXY: { base: 104.2, spread: 0.3 },
  VIX: { base: 14.8, spread: 0.6 },
};

/* ── Hook ── */

export function useMarketData(symbols: string[]): {
  ticks: Record<string, MarketTick>;
  isConnected: boolean;
  error: Error | null;
} {
  const [ticks, setTicks] = useState<Record<string, MarketTick>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);

  // Stable symbol list for deps
  const symbolKey = symbols.join(',');

  /* ── Mock tick generator ── */
  const generateMockTicks = useCallback(() => {
    const now = Date.now();
    const result: Record<string, MarketTick> = {};
    for (const sym of symbols) {
      const cfg = BASE_PRICES[sym];
      if (!cfg) continue;
      const delta = (Math.random() - 0.5) * 2 * cfg.spread;
      const price = +(cfg.base + delta).toFixed(sym === 'DXY' || sym === 'VIX' ? 2 : 0);
      const change = +(delta).toFixed(2);
      const changePercent = +((delta / cfg.base) * 100).toFixed(3);
      result[sym] = { price, timestamp: now, change, changePercent };
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolKey]);

  /* ── WebSocket URL detection ── */
  const wsUrl =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WS_URL) ||
    null;

  /* ── WebSocket connection ── */
  const connectWebSocket = useCallback(() => {
    if (!wsUrl || !mountedRef.current) return;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setIsConnected(true);
        setError(null);
        reconnectAttemptRef.current = 0;
        // Subscribe to symbols
        ws.send(JSON.stringify({ type: 'subscribe', symbols }));
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(event.data) as Record<string, MarketTick>;
          setTicks((prev) => ({ ...prev, ...data }));
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        scheduleReconnect();
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setError(new Error('WebSocket connection error'));
        setIsConnected(false);
        ws.close();
      };
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e : new Error('WebSocket connection failed'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl, symbolKey]);

  /* ── Exponential backoff reconnect ── */
  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current) return;
    const attempt = reconnectAttemptRef.current;
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // 1s → 2s → 4s → 8s → max 30s
    reconnectAttemptRef.current = attempt + 1;
    reconnectTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) connectWebSocket();
    }, delay);
  }, [connectWebSocket]);

  /* ── Main effect ── */
  useEffect(() => {
    mountedRef.current = true;

    if (wsUrl) {
      // WebSocket mode
      connectWebSocket();
    } else {
      // Mock mode
      setIsConnected(true);
      // Generate initial ticks immediately
      setTicks(generateMockTicks());

      intervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          setTicks(generateMockTicks());
        }
      }, 1000);
    }

    return () => {
      mountedRef.current = false;

      // Cleanup interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Cleanup WebSocket
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Cleanup reconnect timer
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [wsUrl, connectWebSocket, generateMockTicks]);

  return { ticks, isConnected, error };
}
