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
    ticker
  });

  // Loading skeleton
  if (isLoading && !summary) {
    return (
      <div className="w-full bg-stock-bg-secondary border-b border-stock-bg-panel mb-6">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="animate-pulse">
            <div className="h-6 w-64 bg-stock-bg-panel rounded mb-6" />
            <div className="flex gap-4 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-stock-bg-panel p-3 min-w-[150px] rounded-lg">
                  <div className="h-3 w-20 bg-stock-bg rounded mb-2" />
                  <div className="h-5 w-24 bg-stock-bg rounded mb-1" />
                  <div className="h-4 w-16 bg-stock-bg rounded" />
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-stock-bg-panel p-4 rounded-lg">
                <div className="h-4 w-32 bg-stock-bg rounded mb-2" />
                <div className="h-3 w-full bg-stock-bg rounded mb-2" />
                <div className="h-3 w-full bg-stock-bg rounded" />
              </div>
              <div className="bg-stock-bg-panel p-4 rounded-lg">
                <div className="h-4 w-32 bg-stock-bg rounded mb-2" />
                <div className="h-3 w-full bg-stock-bg rounded mb-2" />
                <div className="h-3 w-full bg-stock-bg rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show market data even if summary hasn't arrived yet
  if (!summary && marketData && marketData.length > 0) {
    return (
      <div className="w-full bg-stock-bg-secondary border-b border-stock-bg-panel mb-6">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              What's happening with {ticker} today?
            </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
            {marketData.map((index) => (
              <div
                key={index.symbol}
                className="bg-stock-bg-panel rounded-lg p-3 min-w-[150px] flex-shrink-0 hover:bg-stock-bg-panel/80 transition-colors"
              >
                <div className="text-xs text-stock-text-muted font-medium mb-1">
                  {index.name}
                </div>
                <div className="text-lg font-bold text-white mb-1">
                  {index.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
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
            ))}
          </div>
          <div className="mt-4 text-sm text-stock-text-muted">
            Generating market analysis...
          </div>
        </div>
      </div>
    );
  }

  // Don't show anything if not loading, no summary, and no market data
  if (!summary && !isLoading) {
    return null;
  }

  // If we have summary, show it
  if (!summary) {
    return null;
  }

  return (
    <div className="w-full bg-stock-bg-secondary border-b border-stock-bg-panel mb-6">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            What's happening with {ticker} today?
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-stock-bg-panel rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5 text-stock-text-secondary" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-stock-text-secondary" />
            )}
          </button>
        </div>

      {isExpanded && (
        <div className="space-y-4 animate-fade-in">
          {/* Market Indices Strip */}
          {marketData && marketData.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
              {marketData.map((index) => (
                <div
                  key={index.symbol}
                  className="bg-stock-bg-panel rounded-lg p-3 min-w-[150px] flex-shrink-0 hover:bg-stock-bg-panel/80 transition-colors"
                >
                  <div className="text-xs text-stock-text-muted font-medium mb-1">
                    {index.name}
                  </div>
                  <div className="text-lg font-bold text-white mb-1">
                    {index.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
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
              ))}
            </div>
          )}

          {/* AI-Generated Summary */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Market Overview */}
            <div className="bg-stock-bg-panel rounded-lg p-4">
              <h4 className="text-sm font-semibold text-stock-primary mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stock-primary" />
                Market Overview
              </h4>
              <p className="text-sm text-stock-text-primary leading-relaxed">
                {summary.market_overview}
              </p>
            </div>

            {/* Stock Context */}
            <div className="bg-stock-bg-panel rounded-lg p-4">
              <h4 className="text-sm font-semibold text-stock-success mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stock-success" />
                Stock Context
              </h4>
              <p className="text-sm text-stock-text-primary leading-relaxed">
                {summary.stock_context}
              </p>
            </div>
          </div>

          {/* Key Catalysts */}
          {summary.key_catalysts.length > 0 && (
            <div className="bg-stock-bg-panel rounded-lg p-4">
              <h4 className="text-sm font-semibold text-stock-warning mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stock-warning" />
                Key Catalysts
              </h4>
              <ul className="space-y-2">
                {summary.key_catalysts.map((catalyst, idx) => (
                  <li key={idx} className="flex items-start gap-3">
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
            <div className="bg-stock-bg-panel rounded-lg p-4">
              <h4 className="text-sm font-semibold text-stock-primary mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stock-primary" />
                Top Headlines
              </h4>
              <div className="space-y-2">
                {summary.top_headlines.map((headline, idx) => (
                  <a
                    key={idx}
                    href={headline.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 rounded-lg hover:bg-stock-bg transition-colors group"
                  >
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 text-xs font-bold text-stock-text-muted mt-0.5">
                        {idx + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-stock-text-primary group-hover:text-stock-primary transition-colors leading-relaxed">
                          {headline.title}
                        </p>
                        <span className="text-xs text-stock-text-muted">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stock-text-muted">Market Sentiment:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                ({(summary.confidence_score * 100).toFixed(0)}% confidence)
              </span>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
