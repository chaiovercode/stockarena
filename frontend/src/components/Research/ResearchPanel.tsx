import { useState, useMemo } from 'react';
import { FunnelIcon, ClockIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { NewsItem, MarketIndex, SummaryAnalysis } from '../../types';
import { NewsCard } from './NewsCard';
import { SummaryCard } from './SummaryCard';
import { sortByDate, getUniqueSources } from '../../utils/dateFormat';

interface ResearchPanelProps {
  newsItems: NewsItem[];
  ticker: string;
  isLoading: boolean;
  summaryAnalysis: SummaryAnalysis | null;
  marketData: MarketIndex[] | null;
}

export function ResearchPanel({ newsItems, ticker, isLoading, summaryAnalysis, marketData }: ResearchPanelProps) {
  // Sort news items by date (latest first)
  const processedNews = useMemo(() => {
    return sortByDate(newsItems);
  }, [newsItems]);

  return (
    <div className="stock-card p-6" style={{ backgroundColor: '#17181F' }}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Research</h2>
        <p className="text-sm text-stock-text-secondary mt-0.5">
          Market news and analysis
        </p>
      </div>

      {/* Two Column Layout: Summary + News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Summary */}
        <div className="space-y-4 h-full">
          <SummaryCard
            summary={summaryAnalysis}
            marketData={marketData}
            ticker={ticker}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column: News List (Scrollable) */}
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">Latest News</h3>
          </div>

          {/* News List - Scrollable */}
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-3 overflow-y-auto max-h-[1200px] pr-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-stock-bg-panel p-4 rounded-lg">
                  <div className="h-5 w-3/4 bg-stock-bg rounded mb-3 animate-pulse" />
                  <div className="h-4 w-full bg-stock-bg rounded mb-2 animate-pulse" />
                  <div className="h-4 w-5/6 bg-stock-bg rounded mb-3 animate-pulse" />
                  <div className="flex justify-between">
                    <div className="h-6 w-20 bg-stock-bg rounded animate-pulse" />
                    <div className="h-4 w-16 bg-stock-bg rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : newsItems.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <NewspaperIcon className="w-16 h-16 text-stock-text-muted mb-4 opacity-50" />
              <p className="text-stock-text-secondary font-semibold">No recent news found for {ticker}</p>
              <p className="text-sm text-stock-text-muted mt-2">
                Analysis is based on stock price data, technical indicators, and market trends.
              </p>
            </div>
          ) : newsItems.length === 1 && newsItems[0].source === 'StockArena' ? (
            // Fallback news item case
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <NewspaperIcon className="w-16 h-16 text-stock-text-muted mb-4 opacity-50" />
              <p className="text-stock-text-secondary font-semibold">{newsItems[0].title}</p>
              <p className="text-sm text-stock-text-muted mt-2">{newsItems[0].snippet}</p>
            </div>
          ) : (
            // News list - vertical scroll
            <div className="space-y-3 overflow-y-auto max-h-[1200px] pr-2 scrollbar-thin scrollbar-thumb-stock-bg-panel scrollbar-track-transparent">
              {processedNews.map((item, index) => (
                <NewsCard key={`${item.url}-${index}`} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
