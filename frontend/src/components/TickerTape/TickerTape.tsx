import { useEffect, useState } from 'react';

interface TickerData {
  symbol: string;
  price: number;
  change: number;
  name?: string;
}

export function TickerTape() {
  const [tickers, setTickers] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        const API_URL = import.meta.env.DEV ? 'http://localhost:8000' : '';

        const response = await fetch(`${API_URL}/api/v1/market/ticker-tape`);
        if (response.ok) {
          const data = await response.json();
          if (data.tickers && data.tickers.length > 0) {
            setTickers(data.tickers);
          }
        }
      } catch (error) {
        console.error('Failed to fetch ticker data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickerData();

    // Refresh every 60 seconds
    const interval = setInterval(fetchTickerData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="ticker-tape-container">
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-500 text-sm">Loading market data...</span>
        </div>
      </div>
    );
  }

  // Duplicate tickers for seamless loop
  const duplicatedTickers = [...tickers, ...tickers];

  return (
    <div className="ticker-tape-container">
      <div className="ticker-tape">
        {duplicatedTickers.map((ticker, idx) => (
          <div key={`${ticker.symbol}-${idx}`} className="ticker-item">
            <span className="ticker-symbol">{ticker.symbol}</span>
            <span className="ticker-price">₹{ticker.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            <span className={`ticker-change ${ticker.change >= 0 ? 'positive' : 'negative'}`}>
              {ticker.change >= 0 ? '▲' : '▼'} {Math.abs(ticker.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
