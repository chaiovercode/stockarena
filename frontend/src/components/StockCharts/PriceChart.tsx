import { useState, useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { StockData } from '../../types';
import { EnhancedTooltip } from './EnhancedTooltip';
import { calculateSMA } from '../../utils/technicalIndicators';

interface PriceChartProps {
  stockData: StockData;
}

type TimeRange = '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'MAX';
type ChartType = 'area' | 'candlestick';

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '5D', label: '5D' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: 'YTD', label: 'YTD' },
  { value: '1Y', label: '1Y' },
  { value: 'MAX', label: 'MAX' },
];

interface IndicatorSettings {
  sma20: boolean;
  sma50: boolean;
  sma200: boolean;
}

// Custom Candlestick shape function that uses viewBox coordinates
const renderCandlestick = (props: any) => {
  const { x, y, width, height, payload } = props;

  if (!payload) return <></>;

  const { open, close, high, low } = payload;
  if (open === undefined || close === undefined || high === undefined || low === undefined) return <></>;

  const barWidth = Math.max(Math.min(width * 0.6, 10), 3);
  const centerX = x + width / 2;

  const isGreen = close >= open;
  const color = isGreen ? '#00d395' : '#ff4757';

  // Calculate Y positions using the chart's coordinate space
  // The Bar gives us y and height representing the high-low range
  const priceRange = high - low;
  if (priceRange === 0) return <></>;

  const scale = height / priceRange;

  // Calculate positions relative to the top of the bar (which is at 'high')
  const highY = y;
  const lowY = y + height;
  const openY = y + (high - open) * scale;
  const closeY = y + (high - close) * scale;

  const bodyTop = Math.min(openY, closeY);
  const bodyBottom = Math.max(openY, closeY);
  const bodyHeight = Math.max(Math.abs(bodyBottom - bodyTop), 1);

  return (
    <g>
      {/* Wick from high to low */}
      <line
        x1={centerX}
        y1={highY}
        x2={centerX}
        y2={lowY}
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Candlestick body */}
      <rect
        x={centerX - barWidth / 2}
        y={bodyTop}
        width={barWidth}
        height={bodyHeight}
        fill={isGreen ? color : 'transparent'}
        stroke={color}
        strokeWidth={1.5}
      />
    </g>
  );
};

export function PriceChart({ stockData }: PriceChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [enabledIndicators, setEnabledIndicators] = useState<IndicatorSettings>({
    sma20: false,
    sma50: false,
    sma200: false,
  });

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
        open: price.open,
        high: price.high,
        low: price.low,
        close: price.close,
        volume: price.volume,
        Price: price.close, // Keep for backward compatibility
      };
    });
  }, [stockData.historical_prices, selectedRange]);

  const valueFormatter = (value: number) =>
    `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const isPositive = useMemo(() => {
    if (filteredData.length < 2) return stockData.price_change_percent >= 0;
    return filteredData[filteredData.length - 1].Price >= filteredData[0].Price;
  }, [filteredData, stockData.price_change_percent]);

  // Calculate max volume for volume chart scaling
  const maxVolume = useMemo(() => {
    if (!filteredData.length) return 0;
    return Math.max(...filteredData.map(d => d.volume));
  }, [filteredData]);

  // Calculate volume bar colors (green for up days, red for down days)
  const chartDataWithVolumeColor = useMemo(() => {
    return filteredData.map((data, index) => {
      const prevClose = index > 0 ? filteredData[index - 1].close : data.open;
      const volumeColor = data.close >= prevClose ? '#00d395' : '#ff4757';
      return { ...data, volumeColor };
    });
  }, [filteredData]);

  // Calculate technical indicators and merge with filtered data
  const chartDataWithIndicators = useMemo(() => {
    const fullData = stockData.historical_prices;
    if (!fullData.length) return chartDataWithVolumeColor;

    const sma20 = enabledIndicators.sma20 ? calculateSMA(fullData, 20) : [];
    const sma50 = enabledIndicators.sma50 ? calculateSMA(fullData, 50) : [];
    const sma200 = enabledIndicators.sma200 ? calculateSMA(fullData, 200) : [];

    return chartDataWithVolumeColor.map((data, index) => {
      const smaIndex = fullData.length - filteredData.length + index;
      return {
        ...data,
        sma20: sma20[smaIndex] || null,
        sma50: sma50[smaIndex] || null,
        sma200: sma200[smaIndex] || null,
      };
    });
  }, [stockData.historical_prices, enabledIndicators, chartDataWithVolumeColor, filteredData.length]);

  return (
    <div className="stock-card p-6" style={{ backgroundColor: '#17181F' }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-xl font-bold text-white">Price History</h3>
            <p className="text-xs text-stock-text-muted font-medium">
              {filteredData.length} trading days
            </p>
          </div>
        </div>
        <div
          className={`px-6 py-2 rounded-lg ${
            isPositive
              ? 'bg-stock-success text-white'
              : 'bg-stock-danger text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{isPositive ? '▲' : '▼'}</span>
            <span className="font-semibold">{isPositive ? 'Uptrend' : 'Downtrend'}</span>
          </div>
        </div>
      </div>

      {/* Chart Type Buttons */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-stock-text-secondary">Chart Type:</span>
        <button
          onClick={() => setChartType('area')}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            chartType === 'area'
              ? 'bg-[#5b8ef4] text-white'
              : 'bg-[#2a2e39] text-[#e4e6eb] hover:bg-[#363a45]'
          }`}
        >
          Area
        </button>
        <button
          onClick={() => setChartType('candlestick')}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            chartType === 'candlestick'
              ? 'bg-[#5b8ef4] text-white'
              : 'bg-[#2a2e39] text-[#e4e6eb] hover:bg-[#363a45]'
          }`}
        >
          Candlestick
        </button>
      </div>

      {/* Indicator Toggles */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="text-sm font-medium text-stock-text-secondary">Indicators:</span>
        <button
            onClick={() => setEnabledIndicators(prev => ({ ...prev, sma20: !prev.sma20 }))}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
              enabledIndicators.sma20
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                : 'bg-stock-bg-panel text-stock-text-secondary hover:bg-opacity-80'
            }`}
          >
            <span className={`w-4 h-1 rounded ${enabledIndicators.sma20 ? 'bg-white' : 'bg-orange-500'}`}></span>
            SMA 20
          </button>
          <button
            onClick={() => setEnabledIndicators(prev => ({ ...prev, sma50: !prev.sma50 }))}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
              enabledIndicators.sma50
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                : 'bg-stock-bg-panel text-stock-text-secondary hover:bg-opacity-80'
            }`}
          >
            <span className={`w-4 h-1 rounded ${enabledIndicators.sma50 ? 'bg-white' : 'bg-blue-500'}`}></span>
            SMA 50
          </button>
          <button
            onClick={() => setEnabledIndicators(prev => ({ ...prev, sma200: !prev.sma200 }))}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
              enabledIndicators.sma200
                ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                : 'bg-stock-bg-panel text-stock-text-secondary hover:bg-opacity-80'
            }`}
          >
            <span className={`w-4 h-1 rounded ${enabledIndicators.sma200 ? 'bg-white' : 'bg-purple-500'}`}></span>
            SMA 200
          </button>
      </div>

      {/* Time Range Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {TIME_RANGES.map((range) => (
          <button
            key={range.value}
            onClick={() => setSelectedRange(range.value)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              selectedRange === range.value
                ? 'bg-[#ffa502] text-black'
                : 'bg-[#2a2e39] text-[#e4e6eb] hover:bg-[#363a45]'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-lg" style={{ backgroundColor: 'transparent' }}>
        <ResponsiveContainer width="100%" height={400} className="md:h-[400px] h-[320px]">
          <ComposedChart data={chartDataWithIndicators} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#00d395' : '#ff4757'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={isPositive ? '#00d395' : '#ff4757'} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" opacity={0.3} />

            <XAxis
              dataKey="date"
              stroke="#8b8e98"
              tick={{ fill: '#e4e6eb', fontSize: 12 }}
              tickLine={{ stroke: '#2a2e39' }}
            />

            {/* Price Y-axis (left) */}
            <YAxis
              yAxisId="price"
              orientation="left"
              stroke="#8b8e98"
              tick={{ fill: '#e4e6eb', fontSize: 12 }}
              tickLine={{ stroke: '#2a2e39' }}
              tickFormatter={valueFormatter}
              domain={['auto', 'auto']}
            />

            {/* Volume Y-axis (right) */}
            <YAxis
              yAxisId="volume"
              orientation="right"
              stroke="#8b8e98"
              tick={{ fill: '#8b8e98', fontSize: 10 }}
              tickLine={{ stroke: '#2a2e39' }}
              domain={[0, maxVolume * 4]}
              hide={true}
            />

            <Tooltip content={<EnhancedTooltip chartType={chartType} />} />

            {/* Volume bars */}
            <Bar
              yAxisId="volume"
              dataKey="volume"
              fill="#5b8ef4"
              opacity={0.3}
              shape={(props: any) => {
                const { x, y, width, height, volumeColor } = props;
                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={volumeColor}
                    opacity={0.3}
                  />
                );
              }}
            />

            {/* Price chart - Area or Candlestick */}
            {chartType === 'area' ? (
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="close"
                stroke={isPositive ? '#00d395' : '#ff4757'}
                strokeWidth={3}
                fill="url(#colorPrice)"
                animationDuration={800}
              />
            ) : (
              <>
                {/* Candlestick chart */}
                <Bar
                  yAxisId="price"
                  dataKey={(data: any) => [data.low, data.high]}
                  fill="transparent"
                  shape={renderCandlestick}
                />
              </>
            )}

            {/* SMA indicators */}
            {enabledIndicators.sma20 && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="sma20"
                stroke="#ffa502"
                strokeWidth={1.5}
                dot={false}
                name="SMA 20"
                connectNulls={true}
              />
            )}

            {enabledIndicators.sma50 && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="sma50"
                stroke="#5b8ef4"
                strokeWidth={1.5}
                dot={false}
                name="SMA 50"
                connectNulls={true}
              />
            )}

            {enabledIndicators.sma200 && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="sma200"
                stroke="#a55eea"
                strokeWidth={2}
                dot={false}
                name="SMA 200"
                connectNulls={true}
              />
            )}

            <Brush
              dataKey="date"
              height={30}
              stroke="#5b8ef4"
              fill="#17181F"
              travellerWidth={12}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
