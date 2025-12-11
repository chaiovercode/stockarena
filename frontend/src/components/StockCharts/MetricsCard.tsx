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
  'Shareholding Pattern': 'Promoters = founders/management (>50% shows commitment). FIIs = Foreign Institutional Investors. DIIs = Domestic Institutional Investors (MFs, insurance). Public = retail investors.',
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

  // Helper function to get color class based on metric
  const getMetricColor = (label: string, rawValue: number | null | undefined): string => {
    if (rawValue === null || rawValue === undefined) return 'text-white';

    switch (label) {
      case 'P/E Ratio':
        // Lower is generally better, but too low is bad
        return rawValue < 15 ? 'text-stock-success' : rawValue < 25 ? 'text-stock-warning' : 'text-stock-danger';
      case 'EPS':
        return rawValue > 0 ? 'text-stock-success' : 'text-stock-danger';
      case 'P/B Ratio':
        return rawValue < 3 ? 'text-stock-success' : rawValue < 5 ? 'text-stock-warning' : 'text-stock-danger';
      case 'Beta':
        return rawValue < 1 ? 'text-stock-success' : rawValue < 1.5 ? 'text-stock-warning' : 'text-stock-danger';
      case 'Div Yield':
        return rawValue > 2 ? 'text-stock-success' : rawValue > 1 ? 'text-stock-warning' : 'text-white';
      case 'D/E Ratio':
        return rawValue < 1 ? 'text-stock-success' : rawValue < 2 ? 'text-stock-warning' : 'text-stock-danger';
      case 'ROE':
        return rawValue > 15 ? 'text-stock-success' : rawValue > 10 ? 'text-stock-warning' : 'text-stock-danger';
      case 'Target Price':
        return rawValue > stockData.current_price ? 'text-stock-success' : 'text-stock-danger';
      default:
        return 'text-white';
    }
  };

  const basicMetrics = [
    { label: 'Market Cap', value: stockData.market_cap ? formatNumber(stockData.market_cap) : 'N/A', color: 'text-white' },
    { label: 'P/E Ratio', value: stockData.pe_ratio?.toFixed(2) || 'N/A', color: getMetricColor('P/E Ratio', stockData.pe_ratio) },
    { label: '52W High', value: `₹${stockData.fifty_two_week_high.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-white' },
    { label: '52W Low', value: `₹${stockData.fifty_two_week_low.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-white' },
    { label: 'Volume', value: formatNumber(stockData.volume), color: 'text-white' },
  ];

  const fundamentalMetrics = [
    { label: 'EPS', value: stockData.eps ? `₹${stockData.eps.toFixed(2)}` : 'N/A', color: getMetricColor('EPS', stockData.eps) },
    { label: 'P/B Ratio', value: stockData.pb_ratio?.toFixed(2) || 'N/A', color: getMetricColor('P/B Ratio', stockData.pb_ratio) },
    { label: 'Book Value', value: stockData.book_value ? `₹${stockData.book_value.toFixed(2)}` : 'N/A', color: 'text-stock-info' },
    { label: 'Beta', value: stockData.beta?.toFixed(2) || 'N/A', color: getMetricColor('Beta', stockData.beta) },
    { label: 'Div Yield', value: stockData.dividend_yield ? `${stockData.dividend_yield.toFixed(2)}%` : 'N/A', color: getMetricColor('Div Yield', stockData.dividend_yield) },
  ];

  const financialHealth = [
    { label: 'D/E Ratio', value: stockData.debt_to_equity?.toFixed(2) || 'N/A', color: getMetricColor('D/E Ratio', stockData.debt_to_equity) },
    { label: 'ROE', value: stockData.roe ? `${stockData.roe.toFixed(2)}%` : 'N/A', color: getMetricColor('ROE', stockData.roe) },
    { label: 'Q Revenue', value: stockData.quarterly_revenue ? formatNumber(stockData.quarterly_revenue) : 'N/A', color: 'text-stock-primary' },
    { label: 'Q Profit', value: stockData.quarterly_profit ? formatNumber(stockData.quarterly_profit) : 'N/A', color: 'text-stock-primary' },
    { label: 'Target Price', value: stockData.target_price ? `₹${stockData.target_price.toFixed(0)}` : 'N/A', color: getMetricColor('Target Price', stockData.target_price) },
  ];

  const renderMetricWithTooltip = (label: string, value: string, colorClass: string = 'text-white') => (
    <div className="relative">
      <div className="flex items-center justify-center gap-1">
        <p className="text-xs font-semibold text-stock-text-secondary uppercase tracking-wide">
          {label}
        </p>
        {METRIC_TOOLTIPS[label] && (
          <button
            onClick={() => setActiveTooltip(activeTooltip === label ? null : label)}
            className="text-stock-text-muted hover:text-stock-primary transition-colors"
          >
            <InformationCircleIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <p className={`font-semibold ${colorClass} mt-1`}>{value}</p>
      {activeTooltip === label && METRIC_TOOLTIPS[label] && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-stock-bg-card rounded-lg text-xs text-stock-text-primary shadow-lg">
          {METRIC_TOOLTIPS[label]}
        </div>
      )}
    </div>
  );

  const totalAnalystRecs = stockData.analyst_buy + stockData.analyst_hold + stockData.analyst_sell;
  const hasHoldings = stockData.promoter_holding !== null || stockData.fii_holding !== null || stockData.dii_holding !== null || stockData.public_holding !== null;
  const hasAnalyst = totalAnalystRecs > 0;

  return (
    <div className="stock-card p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {stockData.company_name || stockData.ticker}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="stock-chip text-xs">{stockData.ticker}</span>
              {stockData.sector && (
                <span className="stock-chip text-xs">{stockData.sector}</span>
              )}
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              ₹{stockData.current_price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div
            className="px-4 py-2 rounded-lg font-bold"
            style={{
              backgroundColor: isPositive ? 'rgba(0, 211, 149, 0.2)' : 'rgba(255, 71, 87, 0.2)',
              color: isPositive ? '#00d395' : '#ff4757',
            }}
          >
            <div className="flex items-center gap-1">
              <span>
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
            className="p-3 rounded-lg text-center transition-colors"
            style={{ backgroundColor: '#17181F' }}
          >
            {renderMetricWithTooltip(metric.label, metric.value, metric.color)}
          </div>
        ))}
      </div>

      {/* Fundamentals & Financials */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {fundamentalMetrics.map((metric, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg text-center transition-colors"
            style={{ backgroundColor: '#17181F' }}
          >
            {renderMetricWithTooltip(metric.label, metric.value, metric.color)}
          </div>
        ))}
      </div>

      {/* Financial Health */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {financialHealth.map((metric, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg text-center transition-colors"
            style={{ backgroundColor: '#17181F' }}
          >
            {renderMetricWithTooltip(metric.label, metric.value, metric.color)}
          </div>
        ))}
      </div>

      {/* Shareholding & Analyst Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Shareholding Pattern */}
        {hasHoldings && (
          <div className="p-4 rounded-lg relative" style={{ backgroundColor: '#17181F' }}>
            <div className="flex items-center gap-1 mb-3">
              <p className="text-xs font-semibold text-stock-primary uppercase tracking-wide">
                Shareholding Pattern
              </p>
              <button
                onClick={() => setActiveTooltip(activeTooltip === 'Shareholding Pattern' ? null : 'Shareholding Pattern')}
                className="text-stock-text-muted hover:text-stock-primary transition-colors"
              >
                <InformationCircleIcon className="w-3.5 h-3.5" />
              </button>
              {activeTooltip === 'Shareholding Pattern' && (
                <div className="absolute z-50 top-12 left-4 w-64 p-3 bg-stock-bg-card rounded-lg text-xs text-stock-text-primary shadow-lg">
                  {METRIC_TOOLTIPS['Shareholding Pattern']}
                </div>
              )}
            </div>
            <div className="space-y-2">
              {stockData.promoter_holding !== null && stockData.promoter_holding !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stock-text-secondary">Promoters</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-black/40 rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{ width: `${Math.min(stockData.promoter_holding, 100)}%`, backgroundColor: '#ffa502' }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white w-12 text-right">
                      {stockData.promoter_holding.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
              {stockData.fii_holding !== null && stockData.fii_holding !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stock-text-secondary">FIIs</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-black/40 rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{ width: `${Math.min(stockData.fii_holding, 100)}%`, backgroundColor: '#1dd1a1' }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white w-12 text-right">
                      {stockData.fii_holding.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
              {stockData.dii_holding !== null && stockData.dii_holding !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stock-text-secondary">DIIs</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-black/40 rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{ width: `${Math.min(stockData.dii_holding, 100)}%`, backgroundColor: '#5b8ef4' }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white w-12 text-right">
                      {stockData.dii_holding.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
              {stockData.public_holding !== null && stockData.public_holding !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stock-text-secondary">Public</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-black/40 rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{ width: `${Math.min(stockData.public_holding, 100)}%`, backgroundColor: '#00d395' }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white w-12 text-right">
                      {stockData.public_holding.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analyst Recommendations */}
        {hasAnalyst && (
          <div className="p-4 rounded-lg relative" style={{ backgroundColor: '#17181F' }}>
            <div className="flex items-center gap-1 mb-3">
              <p className="text-xs font-semibold text-stock-primary uppercase tracking-wide">
                Analyst Recommendations
              </p>
              <button
                onClick={() => setActiveTooltip(activeTooltip === 'Analyst Recommendations' ? null : 'Analyst Recommendations')}
                className="text-stock-text-muted hover:text-stock-primary transition-colors"
              >
                <InformationCircleIcon className="w-3.5 h-3.5" />
              </button>
              {activeTooltip === 'Analyst Recommendations' && (
                <div className="absolute z-50 top-12 left-4 w-64 p-3 bg-stock-bg-card rounded-lg text-xs text-stock-text-primary shadow-lg">
                  {METRIC_TOOLTIPS['Analyst Recommendations']}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex h-4 rounded overflow-hidden bg-black/40">
                  <div
                    style={{ width: `${(stockData.analyst_buy / totalAnalystRecs) * 100}%`, backgroundColor: '#00d395' }}
                  />
                  <div
                    style={{ width: `${(stockData.analyst_hold / totalAnalystRecs) * 100}%`, backgroundColor: '#ffa502' }}
                  />
                  <div
                    style={{ width: `${(stockData.analyst_sell / totalAnalystRecs) * 100}%`, backgroundColor: '#ff4757' }}
                  />
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="font-semibold" style={{ color: '#00d395' }}>{stockData.analyst_buy} Buy</span>
                <span className="font-semibold" style={{ color: '#ffa502' }}>{stockData.analyst_hold} Hold</span>
                <span className="font-semibold" style={{ color: '#ff4757' }}>{stockData.analyst_sell} Sell</span>
              </div>
            </div>
            {stockData.revenue_growth !== null && stockData.profit_growth !== null && (
              <div className="flex gap-4 mt-3 pt-3 border-t border-white/5">
                <div className="text-xs">
                  <span className="text-stock-text-secondary">Rev Growth (QoQ): </span>
                  <span className="font-semibold" style={{ color: stockData.revenue_growth >= 0 ? '#00d395' : '#ff4757' }}>
                    {stockData.revenue_growth >= 0 ? '+' : ''}{stockData.revenue_growth.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-stock-text-secondary">Profit Growth (QoQ): </span>
                  <span className="font-semibold" style={{ color: stockData.profit_growth >= 0 ? '#00d395' : '#ff4757' }}>
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
