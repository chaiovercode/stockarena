import { AgentAnalysis } from '../../types';

interface BullAgentProps {
  analysis: AgentAnalysis | null;
  isActive: boolean;
  roundNumber?: number;
}

// Calculate argument importance based on confidence
const getImportanceLevel = (confidence: number): { label: string; stars: number; color: string } => {
  if (confidence >= 0.8) return { label: 'Critical', stars: 3, color: '#00d395' };
  if (confidence >= 0.6) return { label: 'Important', stars: 2, color: '#ffa502' };
  return { label: 'Supporting', stars: 1, color: '#8b8e98' };
};

export function BullAgent({ analysis, isActive, roundNumber }: BullAgentProps) {
  return (
    <div
      className={`stock-card p-6 transition-all duration-300 h-full ${
        isActive
          ? 'border-stock-success/50 shadow-lg'
          : analysis
          ? 'border-stock-success/30'
          : ''
      }`}
      style={{
        background: analysis || isActive
          ? 'linear-gradient(135deg, rgba(38, 166, 154, 0.08) 0%, rgba(30, 34, 45, 1) 100%)'
          : undefined,
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-stock-success">Bullish Analysis</h3>
          <p className="text-xs text-stock-text-secondary font-medium">
            {roundNumber && roundNumber > 1 ? `Round ${roundNumber}` : 'Investment Case'}
          </p>
        </div>
        {analysis && (
          <div className="relative group">
            <div className="bg-gradient-to-br from-stock-success/20 to-stock-success/5 px-6 py-4 rounded-lg border border-stock-success/30">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-black text-stock-success">
                  {(analysis.confidence_score * 100).toFixed(0)}%
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-stock-text-secondary font-bold uppercase tracking-wider">
                    Confidence
                  </span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-3 rounded-full ${
                          i < Math.ceil(analysis.confidence_score * 5)
                            ? 'bg-stock-success'
                            : 'bg-stock-success/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tooltip on hover */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
              <div className="bg-stock-success/90 backdrop-blur-sm px-3 py-1 rounded-md">
                <span className="text-xs text-white font-semibold whitespace-nowrap">
                  {analysis.confidence_score >= 0.8 ? 'Very High Confidence' :
                   analysis.confidence_score >= 0.6 ? 'High Confidence' :
                   analysis.confidence_score >= 0.4 ? 'Moderate Confidence' : 'Low Confidence'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isActive && !analysis && (
        <div className="py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="loading-dot bg-stock-success" />
            <div className="loading-dot bg-stock-success" />
            <div className="loading-dot bg-stock-success" />
          </div>
          <p className="text-stock-success text-base font-semibold">Analyzing bullish factors...</p>
          <p className="text-sm text-stock-text-muted mt-2">Evaluating investment opportunities</p>
        </div>
      )}

      {/* Analysis Content */}
      {analysis && (
        <div className="flex flex-col">
          {/* Summary */}
          <div className="bg-transparent rounded-lg p-4 h-[120px] overflow-y-auto">
            <p className="text-sm text-stock-text-primary leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Arguments - Fixed height container */}
          {analysis.arguments.length > 0 && (
            <div className="space-y-3 mt-4">
              <p className="text-sm text-stock-primary font-semibold">
                Key Arguments
              </p>
              <div className="space-y-3 h-[500px] overflow-y-auto">
                {analysis.arguments
                  .sort((a, b) => b.confidence - a.confidence) // Sort by importance
                  .map((arg, idx) => {
                  const importance = getImportanceLevel(arg.confidence);
                  return (
                    <div
                      key={idx}
                      className="relative bg-transparent rounded-lg p-4 transition-colors overflow-hidden"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-6 h-6 bg-stock-success/20 rounded flex items-center justify-center flex-shrink-0 text-xs font-semibold text-stock-success">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white mb-2">
                            {arg.point}
                            {/* Importance Stars */}
                            <span className="inline-flex gap-0.5 ml-1.5">
                              {[...Array(importance.stars)].map((_, i) => (
                                <span key={i} style={{ color: importance.color }} className="text-xs">★</span>
                              ))}
                              {[...Array(3 - importance.stars)].map((_, i) => (
                                <span key={i} className="text-xs text-[#2a2e39]">★</span>
                              ))}
                            </span>
                          </p>
                          {/* Importance Badge */}
                          <div className="inline-flex items-center gap-1.5 mb-2">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide"
                              style={{
                                backgroundColor: `${importance.color}20`,
                                color: importance.color,
                                border: `1px solid ${importance.color}40`
                              }}
                            >
                              {importance.label}
                            </span>
                            <span className="text-[10px] text-stock-text-secondary">
                              {(arg.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                          <p className="text-xs text-stock-text-secondary leading-relaxed">{arg.evidence}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sources Section */}
          {analysis.sources && analysis.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stock-success/20">
              <p className="text-xs text-stock-text-secondary font-semibold mb-2">Data Sources</p>
              <div className="flex flex-wrap gap-2">
                {analysis.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stock-success/10 border border-stock-success/20 rounded text-[10px]"
                  >
                    <span className="text-stock-success font-semibold">{source.type}</span>
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stock-text-secondary hover:text-stock-success transition-colors"
                        title={source.name}
                      >
                        {source.name.length > 30 ? source.name.substring(0, 30) + '...' : source.name}
                      </a>
                    ) : (
                      <span className="text-stock-text-secondary" title={source.name}>
                        {source.name.length > 30 ? source.name.substring(0, 30) + '...' : source.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isActive && !analysis && (
        <div className="py-12 text-center">
          <p className="text-stock-text-muted">Awaiting analysis...</p>
        </div>
      )}
    </div>
  );
}
