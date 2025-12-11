import { AgentAnalysis } from '../../types';

interface ModeratorAgentProps {
  analysis: AgentAnalysis | null;
  isActive: boolean;
}

// Calculate argument importance based on confidence
const getImportanceLevel = (confidence: number): { label: string; stars: number; color: string } => {
  if (confidence >= 0.8) return { label: 'Critical', stars: 3, color: '#2962ff' };
  if (confidence >= 0.6) return { label: 'Important', stars: 2, color: '#ffa502' };
  return { label: 'Supporting', stars: 1, color: '#8b8e98' };
};

export function ModeratorAgent({ analysis, isActive }: ModeratorAgentProps) {
  const getVerdictStyle = (recommendation?: string) => {
    if (!recommendation) return { bg: '#17181F', textColor: '#e4e6eb' };

    const upperRec = recommendation.toUpperCase();

    // New suggestive format
    if (upperRec.includes('LOOKS BULLISH') || upperRec.includes('LEANS BULLISH') || upperRec.includes('BULLISH'))
      return { bg: '#00d395', textColor: '#000000' };
    if (upperRec.includes('LOOKS BEARISH') || upperRec.includes('LEANS BEARISH') || upperRec.includes('BEARISH'))
      return { bg: '#ff4757', textColor: '#ffffff' };
    // Legacy format (for backwards compatibility)
    if (upperRec.includes('STRONG BUY') || upperRec.includes('BUY'))
      return { bg: '#00d395', textColor: '#000000' };
    if (upperRec.includes('STRONG SELL') || upperRec.includes('SELL'))
      return { bg: '#ff4757', textColor: '#ffffff' };
    return { bg: '#d4a853', textColor: '#17181F' }; // MIXED SIGNALS / HOLD - muted gold
  };

  const verdictStyle = getVerdictStyle(analysis?.recommendation);

  return (
    <div
      className={`stock-card p-6 transition-all duration-300 ${
        isActive ? 'border-stock-primary/50 shadow-lg' : 'border-stock-primary/30'
      }`}
      style={{
        background: 'linear-gradient(135deg, rgba(41, 98, 255, 0.05) 0%, rgba(30, 34, 45, 1) 100%)',
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-stock-primary">Final Verdict</h3>
            <p className="text-xs text-stock-text-secondary font-medium">Investment Recommendation</p>
          </div>

          {/* Sticky Notes Style Verdict & Confidence */}
          {analysis?.recommendation && (
            <div className="flex flex-wrap items-start gap-4 -mt-3">
            {/* Verdict Sticky Note */}
            <div
              className="relative px-8 py-6 rounded-lg font-black text-2xl tracking-wide transform rotate-[-2deg] transition-transform hover:rotate-0 hover:scale-105 shadow-2xl"
              style={{
                backgroundColor: verdictStyle.bg,
                color: verdictStyle.textColor,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 -2px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* Tape effect at top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/20 backdrop-blur-sm"
                   style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }} />

              <div className="relative z-10">
                {analysis.recommendation.toLowerCase().split(' ').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </div>

              {/* Paper texture overlay */}
              <div className="absolute inset-0 opacity-5 pointer-events-none rounded-lg"
                   style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }} />
            </div>

            {/* Confidence Sticky Note */}
            <div
              className="relative px-6 py-5 bg-gradient-to-br from-[#ffd54f] to-[#ffb300] rounded-lg transform rotate-[2deg] transition-transform hover:rotate-0 hover:scale-105 shadow-2xl"
              style={{
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 -2px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* Tape effect at top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/30 backdrop-blur-sm"
                   style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }} />

              <div className="relative z-10 flex items-center gap-3">
                {/* Circular Progress */}
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="rgba(0,0,0,0.1)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="#17181F"
                      strokeWidth="6"
                      strokeDasharray={`${analysis.confidence_score * 213.6} 213.6`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <span className="text-3xl font-black text-[#17181F]">
                        {(analysis.confidence_score * 100).toFixed(0)}
                      </span>
                      <span className="absolute -top-1 -right-3 text-sm font-bold text-[#17181F]">%</span>
                    </div>
                  </div>
                </div>

                {/* Confidence Details */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#17181F]/60 uppercase tracking-wider mb-1">
                    Confidence
                  </span>
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-5 rounded-full ${
                          i < Math.ceil(analysis.confidence_score * 5)
                            ? 'bg-[#17181F]'
                            : 'bg-[#17181F]/20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#17181F]/80">
                    {analysis.confidence_score >= 0.8 ? 'Very High' :
                     analysis.confidence_score >= 0.6 ? 'High' :
                     analysis.confidence_score >= 0.4 ? 'Moderate' : 'Low'}
                  </span>
                </div>
              </div>

              {/* Paper texture overlay */}
              <div className="absolute inset-0 opacity-5 pointer-events-none rounded-lg"
                   style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }} />
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isActive && !analysis && (
        <div className="py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="loading-dot bg-stock-primary" />
            <div className="loading-dot bg-stock-primary" />
            <div className="loading-dot bg-stock-primary" />
          </div>
          <p className="text-stock-primary text-base font-semibold">Generating final analysis...</p>
          <p className="text-sm text-stock-text-muted mt-2">Weighing all factors</p>
        </div>
      )}

      {/* Analysis Content */}
      {analysis && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-transparent rounded-lg p-5">
            <p className="text-stock-text-primary leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Key Factors */}
          {analysis.arguments.length > 0 && (
            <div>
              <p className="text-sm text-stock-primary font-semibold uppercase mb-4">
                Key Deciding Factors
              </p>
              <div className="space-y-3">
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
                          <div className="w-6 h-6 bg-stock-primary/20 rounded flex items-center justify-center flex-shrink-0 text-xs font-semibold text-stock-primary">
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
            <div className="mt-4 pt-4 border-t border-stock-primary/20">
              <p className="text-xs text-stock-text-secondary font-semibold mb-2">Data Sources</p>
              <div className="flex flex-wrap gap-2">
                {analysis.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stock-primary/10 border border-stock-primary/20 rounded text-[10px]"
                  >
                    <span className="text-stock-primary font-semibold">{source.type}</span>
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stock-text-secondary hover:text-stock-primary transition-colors"
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
          <p className="text-stock-text-muted">Awaiting final analysis...</p>
        </div>
      )}
    </div>
  );
}
