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
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'relevance'>('date');

  // Get unique sources for filtering
  const uniqueSources = useMemo(() => getUniqueSources(newsItems), [newsItems]);

  // Filter and sort news items
  const processedNews = useMemo(() => {
    let filtered = newsItems;

    // Filter by source if selected
    if (selectedSource) {
      filtered = filtered.filter(item => item.source === selectedSource);
    }

    // Sort
    if (sortBy === 'date') {
      filtered = sortByDate(filtered);
    }
    // 'relevance' keeps original order from API

    return filtered;
  }, [newsItems, selectedSource, sortBy]);

  // Determine how many items to show
  const displayedNews = isExpanded ? processedNews : processedNews.slice(0, 6);
  const hasMore = processedNews.length > 6;
  const remainingCount = processedNews.length - 6;

  // Toggle source filter
  const toggleSource = (source: string) => {
    setSelectedSource(prev => prev === source ? null : source);
  };

  return (
    <>
      {/* Summary Card - Full Width - Always shown */}
      <SummaryCard
        summary={summaryAnalysis}
        marketData={marketData}
        ticker={ticker}
        isLoading={isLoading}
      />

      {/* Research Panel - News Grid */}
      {isLoading ? (
        // Loading skeleton for news
        <div className="stock-card p-6">
          <div className="mb-6">
            <div className="h-8 w-32 bg-stock-bg-panel rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-stock-bg-panel rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="stock-card bg-stock-bg-panel p-5 min-h-[180px]">
                <div className="h-5 w-3/4 bg-stock-bg rounded mb-3 animate-pulse" />
                <div className="h-4 w-full bg-stock-bg rounded mb-2 animate-pulse" />
                <div className="h-4 w-5/6 bg-stock-bg rounded mb-4 animate-pulse" />
                <div className="flex justify-between mt-auto">
                  <div className="h-6 w-20 bg-stock-bg rounded animate-pulse" />
                  <div className="h-4 w-16 bg-stock-bg rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : newsItems.length === 0 ? (
        // Empty state
        <div className="stock-card p-12 text-center">
          <NewspaperIcon className="w-16 h-16 text-stock-text-muted mx-auto mb-4 opacity-50" />
          <p className="text-stock-text-secondary">No news available for {ticker}</p>
          <p className="text-sm text-stock-text-muted mt-2">
            Check back later for market updates and analysis
          </p>
        </div>
      ) : (
        // News grid
        <div className="stock-card p-6">
        {/* Header with Controls */}
        <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold text-white">Research</h2>
            <p className="text-sm text-stock-text-secondary mt-0.5">
              Market news and analysis
            </p>
          </div>

          {/* Sort Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy(prev => prev === 'date' ? 'relevance' : 'date')}
              className="stock-btn px-3 py-2 flex items-center gap-2 text-sm"
            >
              <ClockIcon className="w-4 h-4" />
              {sortBy === 'date' ? 'Date' : 'Relevance'}
            </button>
          </div>
        </div>

        {/* Source Filter Badges */}
        {uniqueSources.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <FunnelIcon className="w-4 h-4 text-stock-text-muted" />
            <button
              onClick={() => setSelectedSource(null)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                selectedSource === null
                  ? 'bg-stock-primary text-white'
                  : 'bg-stock-bg-panel text-stock-text-secondary hover:bg-stock-bg-panel/70'
              }`}
            >
              All ({newsItems.length})
            </button>
            {uniqueSources.map(source => {
              const count = newsItems.filter(item => item.source === source).length;
              return (
                <button
                  key={source}
                  onClick={() => toggleSource(source)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                    selectedSource === source
                      ? 'bg-stock-primary text-white'
                      : 'bg-stock-bg-panel text-stock-text-secondary hover:bg-stock-bg-panel/70'
                  }`}
                >
                  {source} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
        {displayedNews.map((item, index) => (
          <NewsCard key={`${item.url}-${index}`} item={item} index={index} />
        ))}
      </div>

      {/* View More/Less Button */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="stock-btn-primary px-6 py-2.5 text-sm font-medium"
          >
            {isExpanded ? (
              'Show Less'
            ) : (
              `View More (${remainingCount} more ${remainingCount === 1 ? 'article' : 'articles'})`
            )}
          </button>
        </div>
        )}
        </div>
      )}
    </>
  );
}
