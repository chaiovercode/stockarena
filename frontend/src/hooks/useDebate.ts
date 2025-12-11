import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DebateState, StreamUpdate, DebatePhase, TimeHorizon } from '../types';
import { useWebSocket } from './useWebSocket';

const createInitialState = (sessionId: string): DebateState => ({
  sessionId,
  ticker: '',
  phase: 'idle',
  currentRound: 1,
  maxRounds: 1,
  stockData: null,
  newsItems: [],
  marketData: null,
  summaryAnalysis: null,
  bullAnalysis: null,
  bearAnalysis: null,
  moderatorAnalysis: null,
  error: null,
});

export function useDebate() {
  const sessionIdRef = useRef(uuidv4());
  const [state, setState] = useState<DebateState>(() =>
    createInitialState(sessionIdRef.current)
  );

  const handleMessage = useCallback((update: StreamUpdate) => {
    console.log('Handling message:', update.type);

    switch (update.type) {
      case 'started':
        setState((prev) => ({
          ...prev,
          ticker: update.ticker || prev.ticker,
          maxRounds: update.max_rounds || prev.maxRounds,
          phase: 'fetching',
          error: null,
        }));
        break;

      case 'data_fetched':
        console.log('[useDebate] data_fetched received:', {
          hasStockData: !!update.stock_data,
          hasNewsItems: !!update.news_items,
          hasMarketData: !!update.market_data,
          marketData: update.market_data
        });
        setState((prev) => ({
          ...prev,
          stockData: update.stock_data || null,
          newsItems: update.news_items || [],
          marketData: update.market_data || null,
          phase: 'summarizing',
        }));
        break;

      case 'summary_complete':
        console.log('[useDebate] ===== SUMMARY_COMPLETE EVENT RECEIVED =====');
        console.log('[useDebate] summary_complete data:', {
          hasSummaryAnalysis: !!update.summary_analysis,
          hasMarketData: !!update.market_data,
          summaryAnalysis: update.summary_analysis,
          marketData: update.market_data
        });
        console.log('[useDebate] Setting state with summary...');
        setState((prev) => {
          const newState = {
            ...prev,
            summaryAnalysis: update.summary_analysis || null,
            marketData: update.market_data || prev.marketData,
            phase: 'bull_analyzing',
          };
          console.log('[useDebate] New state summaryAnalysis:', newState.summaryAnalysis);
          return newState;
        });
        console.log('[useDebate] ===== SUMMARY STATE UPDATED =====');
        break;

      case 'agent_start':
        setState((prev) => {
          let phase: DebatePhase = prev.phase;
          if (update.agent === 'bull') phase = 'bull_analyzing';
          else if (update.agent === 'bear') phase = 'bear_analyzing';
          else if (update.agent === 'moderator') phase = 'moderating';
          return {
            ...prev,
            phase,
            currentRound: update.round_number || prev.currentRound,
          };
        });
        break;

      case 'agent_response':
        setState((prev) => {
          const newState = { ...prev };
          if (update.agent === 'bull' && update.analysis) {
            newState.bullAnalysis = update.analysis;
            newState.phase = 'bear_analyzing';
          } else if (update.agent === 'bear' && update.analysis) {
            newState.bearAnalysis = update.analysis;
            // Check if more rounds or go to moderator
            if (prev.currentRound < prev.maxRounds) {
              newState.phase = 'bull_analyzing';
            } else {
              newState.phase = 'moderating';
            }
          } else if (update.agent === 'moderator' && update.analysis) {
            newState.moderatorAnalysis = update.analysis;
            newState.phase = 'complete';
          }
          return newState;
        });
        break;

      case 'round_complete':
        setState((prev) => ({
          ...prev,
          currentRound: (update.round_number || prev.currentRound) + 1,
        }));
        break;

      case 'error':
        setState((prev) => ({
          ...prev,
          phase: 'error',
          error: update.error || 'Unknown error occurred',
        }));
        break;

      case 'complete':
        setState((prev) => ({
          ...prev,
          phase: 'complete',
        }));
        break;

      case 'node_start':
      case 'pong':
        // Ignore these
        break;

      default:
        console.log('Unknown message type:', update.type);
    }
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('WebSocket error in useDebate:', error);
    // Only set error if we're in an active state
    setState((prev) => {
      if (prev.phase !== 'idle' && prev.phase !== 'complete') {
        return {
          ...prev,
          phase: 'error',
          error: error.message,
        };
      }
      return prev;
    });
  }, []);

  const handleConnect = useCallback(() => {
    console.log('WebSocket connected in useDebate');
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log('WebSocket disconnected in useDebate');
  }, []);

  const { isConnected, startDebate: wsStartDebate } = useWebSocket(
    sessionIdRef.current,
    {
      onMessage: handleMessage,
      onError: handleError,
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
    }
  );

  const startDebate = useCallback(
    (ticker: string, exchange: string = 'NSE', maxRounds: number = 1, timeHorizon: TimeHorizon = 'medium_term') => {
      // Generate new session ID for new debate
      sessionIdRef.current = uuidv4();

      setState((prev) => ({
        ...prev,
        sessionId: sessionIdRef.current,
        ticker,
        phase: 'connecting',
        currentRound: 1,
        maxRounds,
        stockData: null,
        newsItems: [],
        marketData: null,
        summaryAnalysis: null,
        bullAnalysis: null,
        bearAnalysis: null,
        moderatorAnalysis: null,
        error: null,
      }));

      // Start the debate via WebSocket
      wsStartDebate(ticker, exchange, maxRounds, timeHorizon);
    },
    [wsStartDebate]
  );

  const reset = useCallback(() => {
    sessionIdRef.current = uuidv4();
    setState(createInitialState(sessionIdRef.current));
  }, []);

  return {
    state,
    isConnected,
    startDebate,
    reset,
  };
}
