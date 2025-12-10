import { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { StockData } from '../../types';

interface MetricsCardProps {
  stockData: StockData;
}

const METRIC_TOOLTIPS: Record<string, string> = {
  'Market Cap': 'Total market value of all shares. Large cap (>₹20K Cr) = stable, Mid cap (₹5K-20K Cr) = growth potential, Small cap (<₹5K Cr) = high risk/reward.',
  'P/E Ratio': 'Price-to-Earnings ratio. Lower P/E may indicate undervaluation. Compare with industry average. High P/E suggests growth expectations.',
  '52W High': 'Highest price in last 52 weeks. Stocks near highs show strength, but may be overbought.',
  '52W Low': 'Lowest price in last 52 weeks. Stocks near lows may be undervalued or in trouble.',
  'Volume': 'Number of shares traded today. High volume confirms price moves, low volume suggests weak conviction.',
  'EPS': 'Earnings Per Share. Higher EPS = more profitable. Compare YoY growth.',
  'P/B Ratio': 'Price-to-Book ratio. <1 may be undervalued, >3 may be overvalued. Varies by industry.',
  'Book Value': 'Net asset value per share. Compare with market price for value assessment.',
  'Beta': 'Volatility vs market. Beta >1 = more volatile than Nifty, <1 = less volatile. High beta = higher risk/reward.',
  'Div Yield': 'Annual dividend as % of price. Higher yield = income potential. Check if sustainable.',
  'D/E Ratio': 'Debt-to-Equity ratio. <1 = conservative, >2 = high leverage. Varies by industry.',
  'ROE': 'Return on Equity. >15% is good, >20% is excellent. Shows how efficiently company uses shareholder money.',
  'Q Revenue': 'Latest quarterly revenue. Compare with previous quarters for growth trend.',
  'Q Profit': 'Latest quarterly net profit. Check if growing consistently.',
  'Target Price': 'Average analyst price target. Compare with current price for upside/downside potential.',
  'Shareholding Pattern': 'Promoters = company founders/management. Higher promoter holding (>50%) shows skin in game. Institutions = FIIs/DIIs/Mutual Funds.',
  'Analyst Recommendations': 'Aggregated ratings from brokerages. More Buys = bullish consensus. Consider along with target price.',
};

export function MetricsCard({ stockData }: MetricsCardProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const formatNumber = (num: number | null, prefix: string = '') => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 10000000) {
      return `${prefix}${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
      return `${prefix}${(num / 100000).toFixed(2)} L`;
    }
    return `${prefix}${num.toLocaleString('en-IN')}`;
  };

  const formatPercent = (num: number | null) => {
    if (num === null || num === undefined) return 'N/A';
    return `${num.toFixed(2)}%`;
  };

  const isPositive = stockData.price_change_percent >= 0;

  const basicMetrics = [
    { label: 'Market Cap', value: stockData.market_cap ? formatNumber(stockData.market_cap) : 'N/A' },
    { label: 'P/E Ratio', value: stockData.pe_ratio?.toFixed(2) || 'N/A' },
    { label: '52W High', value: `₹${stockData.fifty_two_week_high.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
    { label: '52W Low', value: `₹${stockData.fifty_two_week_low.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
    { label: 'Volume', value: formatNumber(stockData.volume) },
  ];

  const fundamentalMetrics = [
    { label: 'EPS', value: stockData.eps ? `₹${stockData.eps.toFixed(2)}` : 'N/A' },
    { label: 'P/B Ratio', value: stockData.pb_ratio?.toFixed(2) || 'N/A' },
    { label: 'Book Value', value: stockData.book_value ? `₹${stockData.book_value.toFixed(2)}` : 'N/A' },
    { label: 'Beta', value: stockData.beta?.toFixed(2) || 'N/A' },
    { label: 'Div Yield', value: stockData.dividend_yield ? `${stockData.dividend_yield.toFixed(2)}%` : 'N/A' },
  ];

  const financialHealth = [
    { label: 'D/E Ratio', value: stockData.debt_to_equity?.toFixed(2) || 'N/A' },
    { label: 'ROE', value: stockData.roe ? `${stockData.roe.toFixed(2)}%` : 'N/A' },
    { label: 'Q Revenue', value: stockData.quarterly_revenue ? formatNumber(stockData.quarterly_revenue) : 'N/A' },
    { label: 'Q Profit', value: stockData.quarterly_profit ? formatNumber(stockData.quarterly_profit) : 'N/A' },
    { label: 'Target Price', value: stockData.target_price ? `₹${stockData.target_price.toFixed(0)}` : 'N/A' },
  ];

  const renderMetricWithTooltip = (label: string, value: string, colorClass: string = 'text-white') => (
    <div className="relative">
      <div className="flex items-center justify-center gap-1">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        {METRIC_TOOLTIPS[label] && (
          <button
            onClick={() => setActiveTooltip(activeTooltip === label ? null : label)}
            className="text-gray-500 hover:text-comic-yellow transition-colors"
          >
            <InformationCircleIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <p className={`font-bold ${colorClass} mt-1`}>{value}</p>
      {activeTooltip === label && METRIC_TOOLTIPS[label] && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-comic-bg-dark border-2 border-comic-yellow text-xs text-gray-300 rounded shadow-lg">
          {METRIC_TOOLTIPS[label]}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-comic-yellow" />
        </div>
      )}
    </div>
  );

  const totalAnalystRecs = stockData.analyst_buy + stockData.analyst_hold + stockData.analyst_sell;
  const hasHoldings = stockData.promoter_holding || stockData.fii_holding;
  const hasAnalyst = totalAnalystRecs > 0;

  return (
    <div className="comic-panel p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="font-comic text-2xl text-white">
              {stockData.company_name || stockData.ticker}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="comic-chip bg-comic-bg-secondary text-xs">{stockData.ticker}</span>
              {stockData.sector && (
                <span className="comic-chip bg-comic-bg-secondary text-xs">{stockData.sector}</span>
              )}
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-comic text-3xl text-white">
              ₹{stockData.current_price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div
            className={`comic-btn px-4 py-2 ${
              isPositive
                ? 'bg-comic-green text-white'
                : 'bg-comic-red text-white'
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="font-bold">
                {isPositive ? '+' : ''}
                {stockData.price_change_percent.toFixed(2)}%
              </span>
              <span className="text-xs opacity-80">1D</span>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {basicMetrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-comic-bg-dark border-2 border-gray-700 p-3 text-center hover:border-comic-yellow transition-colors"
          >
            {renderMetricWithTooltip(metric.label, metric.value, 'text-white')}
          </div>
        ))}
      </div>

      {/* Fundamentals & Financials */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {fundamentalMetrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-comic-bg-dark border-2 border-gray-700 p-3 text-center hover:border-comic-blue transition-colors"
          >
            {renderMetricWithTooltip(metric.label, metric.value, 'text-comic-blue')}
          </div>
        ))}
      </div>

      {/* Financial Health */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {financialHealth.map((metric, idx) => (
          <div
            key={idx}
            className="bg-comic-bg-dark border-2 border-gray-700 p-3 text-center hover:border-comic-purple transition-colors"
          >
            {renderMetricWithTooltip(metric.label, metric.value, 'text-comic-purple')}
          </div>
        ))}
      </div>

      {/* Shareholding & Analyst Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Shareholding Pattern */}
        {hasHoldings && (
          <div className="bg-comic-bg-dark border-2 border-gray-700 p-4 relative">
            <div className="flex items-center gap-1 mb-3">
              <p className="text-xs font-bold text-comic-yellow uppercase tracking-wide">
                Shareholding Pattern
              </p>
              <button
                onClick={() => setActiveTooltip(activeTooltip === 'Shareholding Pattern' ? null : 'Shareholding Pattern')}
                className="text-gray-500 hover:text-comic-yellow transition-colors"
              >
                <InformationCircleIcon className="w-3.5 h-3.5" />
              </button>
              {activeTooltip === 'Shareholding Pattern' && (
                <div className="absolute z-50 top-12 left-4 w-64 p-3 bg-comic-bg-dark border-2 border-comic-yellow text-xs text-gray-300 rounded shadow-lg">
                  {METRIC_TOOLTIPS['Shareholding Pattern']}
                </div>
              )}
            </div>
            <div className="space-y-2">
              {stockData.promoter_holding && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Promoters</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-700 rounded overflow-hidden">
                      <div
                        className="h-full bg-comic-yellow rounded"
                        style={{ width: `${Math.min(stockData.promoter_holding, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white w-12 text-right">
                      {stockData.promoter_holding.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
              {stockData.fii_holding && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Institutions</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-700 rounded overflow-hidden">
                      <div
                        className="h-full bg-comic-blue rounded"
                        style={{ width: `${Math.min(stockData.fii_holding, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white w-12 text-right">
                      {stockData.fii_holding.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analyst Recommendations */}
        {hasAnalyst && (
          <div className="bg-comic-bg-dark border-2 border-gray-700 p-4 relative">
            <div className="flex items-center gap-1 mb-3">
              <p className="text-xs font-bold text-comic-yellow uppercase tracking-wide">
                Analyst Recommendations
              </p>
              <button
                onClick={() => setActiveTooltip(activeTooltip === 'Analyst Recommendations' ? null : 'Analyst Recommendations')}
                className="text-gray-500 hover:text-comic-yellow transition-colors"
              >
                <InformationCircleIcon className="w-3.5 h-3.5" />
              </button>
              {activeTooltip === 'Analyst Recommendations' && (
                <div className="absolute z-50 top-12 left-4 w-64 p-3 bg-comic-bg-dark border-2 border-comic-yellow text-xs text-gray-300 rounded shadow-lg">
                  {METRIC_TOOLTIPS['Analyst Recommendations']}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex h-4 rounded overflow-hidden">
                  <div
                    className="bg-comic-green"
                    style={{ width: `${(stockData.analyst_buy / totalAnalystRecs) * 100}%` }}
                  />
                  <div
                    className="bg-comic-yellow"
                    style={{ width: `${(stockData.analyst_hold / totalAnalystRecs) * 100}%` }}
                  />
                  <div
                    className="bg-comic-red"
                    style={{ width: `${(stockData.analyst_sell / totalAnalystRecs) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-comic-green font-bold">{stockData.analyst_buy} Buy</span>
                <span className="text-comic-yellow font-bold">{stockData.analyst_hold} Hold</span>
                <span className="text-comic-red font-bold">{stockData.analyst_sell} Sell</span>
              </div>
            </div>
            {stockData.revenue_growth !== null && stockData.profit_growth !== null && (
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-700">
                <div className="text-xs">
                  <span className="text-gray-400">Rev Growth: </span>
                  <span className={stockData.revenue_growth >= 0 ? 'text-comic-green' : 'text-comic-red'}>
                    {stockData.revenue_growth >= 0 ? '+' : ''}{stockData.revenue_growth.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-400">Profit Growth: </span>
                  <span className={stockData.profit_growth >= 0 ? 'text-comic-green' : 'text-comic-red'}>
                    {stockData.profit_growth >= 0 ? '+' : ''}{stockData.profit_growth.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
