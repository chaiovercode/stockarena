import { useState, useMemo } from 'react';
import { AreaChart, CustomTooltipProps } from '@tremor/react';
import { StockData } from '../../types';

const CustomTooltip = ({ payload, active }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0];
  return (
    <div className="bg-comic-bg-secondary px-3 py-2">
      <p className="text-gray-400 text-sm">{data.payload.date}</p>
      <p className="text-white font-bold text-lg">₹{data.value?.toLocaleString('en-IN')}</p>
    </div>
  );
};

interface PriceChartProps {
  stockData: StockData;
}

type TimeRange = '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'MAX';

const TIME_RANGES: TimeRange[] = ['5D', '1M', '3M', '6M', 'YTD', '1Y', 'MAX'];

export function PriceChart({ stockData }: PriceChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');

  const filteredData = useMemo(() => {
    const prices = stockData.historical_prices;
    if (!prices.length) return [];

    const now = new Date();
    let daysToShow: number;

    switch (selectedRange) {
      case '5D':
        daysToShow = 5;
        break;
      case '1M':
        daysToShow = 22;
        break;
      case '3M':
        daysToShow = 66;
        break;
      case '6M':
        daysToShow = 132;
        break;
      case 'YTD':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        daysToShow = Math.ceil((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
        break;
      case '1Y':
        daysToShow = 252;
        break;
      case 'MAX':
      default:
        daysToShow = prices.length;
        break;
    }

    const slicedPrices = prices.slice(-Math.min(daysToShow, prices.length));

    return slicedPrices.map((price) => {
      const d = new Date(price.date);
      const day = d.getDate();
      const month = d.toLocaleString('en-US', { month: 'short' });
      return {
        date: `${day} ${month}`,
        Price: price.close,
      };
    });
  }, [stockData.historical_prices, selectedRange]);

  const valueFormatter = (value: number) =>
    `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const isPositive = useMemo(() => {
    if (filteredData.length < 2) return stockData.price_change_percent >= 0;
    return filteredData[filteredData.length - 1].Price >= filteredData[0].Price;
  }, [filteredData, stockData.price_change_percent]);

  return (
    <div className="comic-panel p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-comic text-xl text-white">PRICE HISTORY</h3>
            <p className="text-xs text-gray-500 font-bold">
              {filteredData.length} trading days
            </p>
          </div>
        </div>
        <div
          className="comic-btn px-6 py-3"
          style={{
            backgroundColor: isPositive ? '#51cf66' : '#ff6b6b',
            boxShadow: isPositive ? '4px 4px 0 #40c057' : '4px 4px 0 #ee5a5a',
            color: '#fff'
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{isPositive ? '▲' : '▼'}</span>
            <span className="font-comic text-lg">{isPositive ? 'UPTREND' : 'DOWNTREND'}</span>
          </div>
        </div>
      </div>

      {/* Time Range Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {TIME_RANGES.map((range) => (
          <button
            key={range}
            onClick={() => setSelectedRange(range)}
            className={`comic-btn px-4 py-2 text-sm ${
              selectedRange === range
                ? 'bg-comic-yellow text-black'
                : 'bg-comic-bg-secondary text-gray-300 hover:bg-comic-purple'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      <div className="bg-comic-bg-dark p-4">
        <AreaChart
          className={`h-64 [&_.recharts-text]:fill-gray-400 ${
            isPositive
              ? '[&_.recharts-area-area]:fill-[#22c55e] [&_.recharts-area-curve]:stroke-[#4ade80]'
              : '[&_.recharts-area-area]:fill-[#ef4444] [&_.recharts-area-curve]:stroke-[#f87171]'
          }`}
          data={filteredData}
          index="date"
          categories={['Price']}
          colors={[isPositive ? 'emerald' : 'red']}
          showLegend={false}
          showGridLines={false}
          curveType="monotone"
          showAnimation={true}
          autoMinValue={true}
          yAxisWidth={70}
          customTooltip={CustomTooltip}
        />
      </div>
    </div>
  );
}
