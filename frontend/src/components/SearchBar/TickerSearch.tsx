import { useState } from 'react';
import { TimeHorizon, TIME_HORIZON_OPTIONS } from '../../types';

interface TickerSearchProps {
  onSearch: (ticker: string, exchange: string, maxRounds: number, timeHorizon: TimeHorizon) => void;
  isLoading: boolean;
}

const popularTickers = [
  { label: 'TATASTEEL', value: 'TATASTEEL' },
  { label: 'RELIANCE', value: 'RELIANCE' },
  { label: 'TCS', value: 'TCS' },
  { label: 'INFY', value: 'INFY' },
  { label: 'HDFCBANK', value: 'HDFCBANK' },
];

export function TickerSearch({ onSearch, isLoading }: TickerSearchProps) {
  const [ticker, setTicker] = useState('');
  const [exchange, setExchange] = useState('NSE');
  const [maxRounds, setMaxRounds] = useState('1');
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('medium_term');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      onSearch(ticker.trim().toUpperCase(), exchange, parseInt(maxRounds), timeHorizon);
    }
  };

  const handleQuickSearch = (tickerValue: string) => {
    setTicker(tickerValue);
    onSearch(tickerValue, exchange, parseInt(maxRounds), timeHorizon);
  };

  return (
    <div className="stock-card p-6" style={{ backgroundColor: '#17181F' }}>
      {/* Section Title */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Search Stock</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Input Row */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Ticker Input */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-stock-text-secondary uppercase mb-2">
              Stock Ticker
            </label>
            <input
              type="text"
              placeholder="e.g., TATASTEEL, RELIANCE"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              disabled={isLoading}
              className="stock-input w-full h-12 px-4 text-base font-medium placeholder:text-stock-text-muted placeholder:font-normal"
            />
          </div>

          {/* Exchange Select */}
          <div>
            <label className="block text-xs font-semibold text-stock-text-secondary uppercase mb-2">
              Exchange
            </label>
            <select
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              disabled={isLoading}
              className="stock-select h-12 px-4 font-medium cursor-pointer"
            >
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
            </select>
          </div>

          {/* Time Horizon Select */}
          <div className="relative group">
            <label className="block text-xs font-semibold text-stock-text-secondary uppercase mb-2 flex items-center gap-1">
              Time Horizon
              <span className="cursor-help text-stock-text-muted hover:text-stock-primary">ⓘ</span>
            </label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value as TimeHorizon)}
              disabled={isLoading}
              className="stock-select h-12 px-4 font-medium cursor-pointer"
            >
              {TIME_HORIZON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.description})
                </option>
              ))}
            </select>
            {/* Tooltip */}
            <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-stock-bg-card rounded-lg text-xs text-stock-text-primary opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
              <p className="mb-2"><span className="text-stock-primary font-semibold">Short-term:</span> Momentum, news sentiment, technical patterns for quick trades</p>
              <p className="mb-2"><span className="text-stock-primary font-semibold">Medium-term:</span> Quarterly results, sector trends, upcoming events</p>
              <p><span className="text-stock-primary font-semibold">Long-term:</span> Valuation, competitive moat, growth story for investors</p>
            </div>
          </div>

          {/* Rounds Select */}
          <div>
            <label className="block text-xs font-semibold text-stock-text-secondary uppercase mb-2">
              Rounds
            </label>
            <select
              value={maxRounds}
              onChange={(e) => setMaxRounds(e.target.value)}
              disabled={isLoading}
              className="stock-select h-12 px-4 font-medium cursor-pointer"
            >
              <option value="1">1 Round</option>
              <option value="2">2 Rounds</option>
              <option value="3">3 Rounds</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={!ticker.trim() || isLoading}
              className="stock-btn-primary h-12 px-8 text-base font-semibold flex items-center gap-2 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <div className="flex gap-1">
                    <div className="loading-dot bg-white" />
                    <div className="loading-dot bg-white" />
                    <div className="loading-dot bg-white" />
                  </div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Analyze</span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Picks */}
        <div className="mt-6 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-stock-text-muted uppercase">Quick Pick:</span>
            {popularTickers.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleQuickSearch(item.value)}
                disabled={isLoading}
                className="stock-btn text-white px-4 py-2 text-sm hover:bg-stock-bg-panel disabled:opacity-50"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
