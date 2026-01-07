import { useEffect, useRef, useCallback, useState } from 'react';
import { StreamUpdate, TimeHorizon } from '../types';

interface UseWebSocketOptions {
  onMessage: (update: StreamUpdate) => void;
  onError: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const WS_URL = import.meta.env.DEV
  ? 'ws://localhost:8001'
  : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;

export function useWebSocket(sessionId: string, options: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<number>();
  const optionsRef = useRef(options);
  const sessionIdRef = useRef(sessionId);

  // Update refs
  optionsRef.current = options;
  sessionIdRef.current = sessionId;

  const connect = useCallback(() => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const ws = new WebSocket(`${WS_URL}/ws/debate/${sessionIdRef.current}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      optionsRef.current.onConnect?.();
    };

    ws.onmessage = (event) => {
      try {
        const update: StreamUpdate = JSON.parse(event.data);
        console.log('WebSocket message:', update);
        optionsRef.current.onMessage(update);
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      optionsRef.current.onError(new Error('WebSocket error'));
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
      wsRef.current = null;
      optionsRef.current.onDisconnect?.();
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const send = useCallback((data: object): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    console.warn('WebSocket not open, cannot send:', data);
    return false;
  }, []);

  const startDebate = useCallback(
    (ticker: string, exchange: string = 'NSE', maxRounds: number = 1, timeHorizon: TimeHorizon = 'medium_term') => {
      const message = {
        type: 'start',
        ticker,
        exchange,
        max_rounds: maxRounds,
        time_horizon: timeHorizon,
      };

      // If connected, send immediately
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        send(message);
        return;
      }

      // If not connected, connect first then send
      connect();

      // Poll for connection and send
      const checkAndSend = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          send(message);
        } else if (wsRef.current?.readyState === WebSocket.CONNECTING) {
          setTimeout(checkAndSend, 100);
        }
      };
      setTimeout(checkAndSend, 100);
    },
    [connect, send]
  );

  // Connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    send,
    startDebate,
    disconnect,
    connect,
  };
}
