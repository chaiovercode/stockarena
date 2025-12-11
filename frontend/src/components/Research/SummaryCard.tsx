import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { MarketIndex, SummaryAnalysis } from '../../types';

interface SummaryCardProps {
  summary: SummaryAnalysis | null;
  marketData: MarketIndex[] | null;
  ticker: string;
  isLoading: boolean;
}

export function SummaryCard({ summary, marketData, ticker, isLoading }: SummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Debug logging
  console.log('[SummaryCard] Render:', {
    hasSummary: !!summary,
    hasMarketData: !!marketData,
    marketDataLength: marketData?.length || 0,
    isLoading,
    ticker,
    summary: summary,
    marketData: marketData
  });

  // Always show the summary section, even if empty
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-transparent p-4 rounded-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-stock-bg-panel rounded" />
          <div className="space-y-3">
            <div className="bg-stock-bg-panel p-3 rounded-lg">
              <div className="h-3 w-16 bg-stock-bg rounded mb-2" />
              <div className="h-5 w-20 bg-stock-bg rounded mb-1" />
              <div className="h-4 w-12 bg-stock-bg rounded" />
            </div>
            <div className="bg-stock-bg-panel p-4 rounded-lg">
              <div className="h-4 w-24 bg-stock-bg rounded mb-2" />
              <div className="h-3 w-full bg-stock-bg rounded mb-2" />
              <div className="h-3 w-full bg-stock-bg rounded" />
            </div>
            <div className="bg-stock-bg-panel p-4 rounded-lg">
              <div className="h-4 w-24 bg-stock-bg rounded mb-2" />
              <div className="h-3 w-full bg-stock-bg rounded mb-2" />
              <div className="h-3 w-3/4 bg-stock-bg rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show market data even if summary hasn't arrived yet
  if (!summary && marketData && marketData.length > 0) {
    return (
      <div className="bg-transparent p-4 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-4">
          Market Overview
        </h3>
        <div className="space-y-2">
          {marketData.map((index) => (
            <div
              key={index.symbol}
              className="rounded-lg p-3 hover:opacity-80 transition-opacity"
              style={{ backgroundColor: '#17181F' }}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-stock-text-muted font-medium">
                  {index.name}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    index.change >= 0 ? 'text-stock-success' : 'text-stock-danger'
                  }`}
                >
                  {index.change >= 0 ? '↑' : '↓'}{' '}
                  {Math.abs(index.change_percent).toFixed(2)}%
                </div>
              </div>
              <div className="text-base font-bold text-white mt-1">
                {index.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-stock-text-muted">
          Generating analysis...
        </div>
      </div>
    );
  }

  // Don't show anything if not loading, no summary, and no market data
  if (!summary && !isLoading && (!marketData || marketData.length === 0)) {
    return (
      <div className="bg-transparent p-4 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
        <p className="text-sm text-stock-text-muted">
          Waiting for analysis to begin...
        </p>
      </div>
    );
  }

  // If we don't have summary yet, return loading/market data state (already handled above)
  if (!summary) {
    return null;
  }

  return (
    <div className="bg-transparent space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Summary</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-stock-bg-panel rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronUpIcon className="w-4 h-4 text-stock-text-secondary" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-stock-text-secondary" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3 animate-fade-in">
          {/* Market Indices */}
          {marketData && marketData.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-stock-text-muted uppercase">Market Indices</h4>
              {marketData.map((index) => (
                <div
                  key={index.symbol}
                  className="rounded-lg p-3 hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: '#17181F' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-stock-text-muted font-medium">
                      {index.name}
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        index.change >= 0 ? 'text-stock-success' : 'text-stock-danger'
                      }`}
                    >
                      {index.change >= 0 ? '↑' : '↓'}{' '}
                      {Math.abs(index.change_percent).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-base font-bold text-white mt-1">
                    {index.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Market Overview */}
          <div className="rounded-lg p-4" style={{ backgroundColor: '#17181F' }}>
            <h4 className="text-xs font-semibold text-stock-primary mb-2 uppercase">
              Market Overview
            </h4>
            <p className="text-sm text-stock-text-primary leading-relaxed">
              {summary.market_overview}
            </p>
          </div>

          {/* Stock Context */}
          <div className="rounded-lg p-4" style={{ backgroundColor: '#17181F' }}>
            <h4 className="text-xs font-semibold text-stock-success mb-2 uppercase">
              Stock Context
            </h4>
            <p className="text-sm text-stock-text-primary leading-relaxed">
              {summary.stock_context}
            </p>
          </div>

          {/* Key Catalysts */}
          {summary.key_catalysts.length > 0 && (
            <div className="rounded-lg p-4" style={{ backgroundColor: '#17181F' }}>
              <h4 className="text-xs font-semibold text-stock-warning mb-3 uppercase">
                Key Catalysts
              </h4>
              <ul className="space-y-2">
                {summary.key_catalysts.map((catalyst, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-stock-warning/20 text-stock-warning flex items-center justify-center text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-stock-text-primary leading-relaxed">
                      {catalyst}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Top Headlines */}
          {summary.top_headlines.length > 0 && (
            <div className="rounded-lg p-4" style={{ backgroundColor: '#17181F' }}>
              <h4 className="text-xs font-semibold text-stock-primary mb-3 uppercase">
                Top Headlines
              </h4>
              <div className="space-y-2">
                {summary.top_headlines.map((headline, idx) => (
                  <a
                    key={idx}
                    href={headline.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 rounded hover:bg-stock-bg transition-colors group"
                  >
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 text-xs font-bold text-stock-text-muted">
                        {idx + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="text-xs text-stock-text-primary group-hover:text-stock-primary transition-colors leading-relaxed">
                          {headline.title}
                        </p>
                        <span className="text-[10px] text-stock-text-muted">
                          {headline.source}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Sentiment Badge */}
          <div className="rounded-lg p-3" style={{ backgroundColor: '#17181F' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stock-text-muted">Sentiment:</span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    summary.market_sentiment === 'bullish'
                      ? 'bg-stock-success/20 text-stock-success'
                      : summary.market_sentiment === 'bearish'
                      ? 'bg-stock-danger/20 text-stock-danger'
                      : 'bg-stock-text-muted/20 text-stock-text-muted'
                  }`}
                >
                  {summary.market_sentiment.toUpperCase()}
                </span>
                <span className="text-xs text-stock-text-muted">
                  ({(summary.confidence_score * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
