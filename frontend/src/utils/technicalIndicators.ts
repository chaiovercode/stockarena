import { HistoricalPrice } from '../types';

/**
 * Calculate Simple Moving Average (SMA)
 * @param data Array of historical prices
 * @param period Number of periods for the moving average
 * @returns Array of SMA values (null for insufficient data points)
 */
export const calculateSMA = (
  data: HistoricalPrice[],
  period: number
): (number | null)[] => {
  if (!data || data.length === 0) return [];

  const result: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const sum = data
        .slice(i - period + 1, i + 1)
        .reduce((acc, price) => acc + price.close, 0);
      result.push(sum / period);
    }
  }

  return result;
};

/**
 * Calculate standard deviation for a dataset
 * @param values Array of numbers
 * @returns Standard deviation
 */
export const calculateStandardDeviation = (values: number[]): number => {
  if (values.length === 0) return 0;

  const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;

  return Math.sqrt(variance);
};

/**
 * Calculate Bollinger Bands
 * @param data Array of historical prices
 * @param period Number of periods (default: 20)
 * @param stdDevMultiplier Standard deviation multiplier (default: 2)
 * @returns Object with upper, middle, and lower bands
 */
export const calculateBollingerBands = (
  data: HistoricalPrice[],
  period: number = 20,
  stdDevMultiplier: number = 2
): {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
} => {
  if (!data || data.length === 0) {
    return { upper: [], middle: [], lower: [] };
  }

  const middle = calculateSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1 || middle[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1).map(p => p.close);
      const stdDev = calculateStandardDeviation(slice);
      const middleValue = middle[i] as number;

      upper.push(middleValue + stdDevMultiplier * stdDev);
      lower.push(middleValue - stdDevMultiplier * stdDev);
    }
  }

  return { upper, middle, lower };
};

/**
 * Calculate Relative Strength Index (RSI)
 * @param data Array of historical prices
 * @param period Number of periods (default: 14)
 * @returns Array of RSI values (0-100 scale, null for insufficient data)
 */
export const calculateRSI = (
  data: HistoricalPrice[],
  period: number = 14
): (number | null)[] => {
  if (!data || data.length < period + 1) {
    return new Array(data?.length || 0).fill(null);
  }

  const result: (number | null)[] = new Array(period).fill(null);

  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close);
  }

  // Calculate initial average gain and loss
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  // Calculate first RSI value
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  result.push(rsi);

  // Calculate subsequent RSI values using smoothed averages
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const currentRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const currentRsi = 100 - (100 / (1 + currentRs));
    result.push(currentRsi);
  }

  return result;
};

/**
 * Format volume number with abbreviations (Cr, L, M)
 * @param volume Volume number
 * @returns Formatted string
 */
export const formatVolume = (volume: number): string => {
  if (volume >= 10000000) {
    return `${(volume / 10000000).toFixed(2)} Cr`;
  }
  if (volume >= 100000) {
    return `${(volume / 100000).toFixed(2)} L`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)} K`;
  }
  return volume.toLocaleString('en-IN');
};
