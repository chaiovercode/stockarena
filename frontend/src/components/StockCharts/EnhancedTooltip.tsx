import { formatVolume } from '../../utils/technicalIndicators';

interface TooltipPayload {
  payload: {
    date: string;
    open?: number;
    high?: number;
    low?: number;
    close: number;
    volume: number;
    Price?: number; // For area chart compatibility
  };
  value?: number;
}

interface EnhancedTooltipProps {
  payload?: TooltipPayload[];
  active?: boolean;
  chartType?: 'area' | 'candlestick';
}

export function EnhancedTooltip({ payload, active, chartType = 'area' }: EnhancedTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const closePrice = data.close || data.Price || 0;

  return (
    <div className="bg-stock-bg-card px-4 py-3 rounded-lg shadow-xl border border-white/10">
      <p className="text-stock-text-secondary text-sm font-medium mb-2">{data.date}</p>

      {chartType === 'candlestick' && data.open !== undefined ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-stock-text-secondary">Open:</span>
            <span className="text-white font-semibold">
              ₹{data.open.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-stock-text-secondary">High:</span>
            <span style={{ color: '#00d395' }} className="font-semibold">
              ₹{data.high?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-stock-text-secondary">Low:</span>
            <span style={{ color: '#ff4757' }} className="font-semibold">
              ₹{data.low?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-stock-text-secondary">Close:</span>
            <span className="text-white font-bold text-base">
              ₹{closePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-white font-bold text-lg">
          ₹{closePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </p>
      )}

      {data.volume > 0 && (
        <div className="mt-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-stock-text-secondary">Volume:</span>
            <span style={{ color: '#1dd1a1' }} className="font-semibold text-sm">
              {formatVolume(data.volume)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
