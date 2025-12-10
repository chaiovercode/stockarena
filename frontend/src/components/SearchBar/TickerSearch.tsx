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
    <div className="comic-panel p-6">
      {/* Section Title */}
      <div className="mb-6">
        <h2 className="font-comic text-2xl text-white">ENTER THE ARENA</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Input Row */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Ticker Input */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Stock Ticker
            </label>
            <input
              type="text"
              placeholder="e.g., TATASTEEL, RELIANCE"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              disabled={isLoading}
              className="comic-input w-full h-14 px-4 text-lg font-bold placeholder:text-gray-600 placeholder:font-normal"
            />
          </div>

          {/* Exchange Select */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Exchange
            </label>
            <select
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              disabled={isLoading}
              className="comic-select h-14 px-4 font-bold cursor-pointer"
            >
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
            </select>
          </div>

          {/* Time Horizon Select */}
          <div className="relative group">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
              Time Horizon
              <span className="cursor-help text-gray-500 hover:text-comic-yellow">ⓘ</span>
            </label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value as TimeHorizon)}
              disabled={isLoading}
              className="comic-select h-14 px-4 font-bold cursor-pointer"
            >
              {TIME_HORIZON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.description})
                </option>
              ))}
            </select>
            {/* Tooltip */}
            <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-comic-bg-dark border-2 border-gray-700 text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
              <p className="mb-2"><span className="text-comic-yellow font-bold">Short-term:</span> Momentum, news sentiment, technical patterns for quick trades</p>
              <p className="mb-2"><span className="text-comic-yellow font-bold">Medium-term:</span> Quarterly results, sector trends, upcoming events</p>
              <p><span className="text-comic-yellow font-bold">Long-term:</span> Valuation, competitive moat, growth story for investors</p>
            </div>
          </div>

          {/* Rounds Select */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Rounds
            </label>
            <select
              value={maxRounds}
              onChange={(e) => setMaxRounds(e.target.value)}
              disabled={isLoading}
              className="comic-select h-14 px-4 font-bold cursor-pointer"
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
              className="comic-btn h-14 px-8 bg-comic-yellow text-black font-comic text-xl flex items-center gap-2 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <div className="flex gap-1">
                    <div className="loading-dot bg-white" />
                    <div className="loading-dot bg-white" />
                    <div className="loading-dot bg-white" />
                  </div>
                  <span>FIGHTING...</span>
                </>
              ) : (
                <span>START BATTLE!</span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Picks */}
        <div className="mt-6 pt-6 border-t-2 border-gray-700">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase">Quick Pick:</span>
            {popularTickers.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleQuickSearch(item.value)}
                disabled={isLoading}
                className="comic-btn bg-comic-bg-secondary text-white px-4 py-2 text-sm hover:bg-comic-purple disabled:opacity-50"
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
