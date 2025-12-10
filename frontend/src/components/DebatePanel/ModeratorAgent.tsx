import { AgentAnalysis } from '../../types';

interface ModeratorAgentProps {
  analysis: AgentAnalysis | null;
  isActive: boolean;
}

export function ModeratorAgent({ analysis, isActive }: ModeratorAgentProps) {
  const getVerdictStyle = (recommendation?: string) => {
    if (!recommendation) return { bg: '#374151', shadow: 'none', textColor: 'white' };
    // New suggestive format
    if (recommendation.includes('LOOKS BULLISH') || recommendation.includes('LEANS BULLISH'))
      return { bg: '#51cf66', shadow: '4px 4px 0 #40c057', textColor: 'white' };
    if (recommendation.includes('LOOKS BEARISH') || recommendation.includes('LEANS BEARISH'))
      return { bg: '#ff6b6b', shadow: '4px 4px 0 #ee5a5a', textColor: 'white' };
    // Legacy format (for backwards compatibility)
    if (recommendation.includes('STRONG BUY') || recommendation.includes('BUY'))
      return { bg: '#51cf66', shadow: '4px 4px 0 #40c057', textColor: 'white' };
    if (recommendation.includes('STRONG SELL') || recommendation.includes('SELL'))
      return { bg: '#ff6b6b', shadow: '4px 4px 0 #ee5a5a', textColor: 'white' };
    return { bg: '#ffd93d', shadow: '4px 4px 0 #e6c235', textColor: 'black' }; // MIXED SIGNALS / HOLD
  };

  const verdictStyle = getVerdictStyle(analysis?.recommendation);

  return (
    <div
      className={`comic-panel p-6 transition-all duration-300 border-comic-yellow ${
        isActive ? 'shadow-comic-yellow animate-pulse-glow' : ''
      }`}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 217, 61, 0.05) 0%, rgba(15, 15, 35, 1) 100%)',
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-comic text-2xl text-comic-yellow">THE VERDICT</h3>
          <p className="text-xs text-gray-400 font-bold uppercase">Final Decision</p>
        </div>

        {/* Verdict Badge */}
        {analysis?.recommendation && (
          <div
            className="comic-btn px-6 py-3 text-center"
            style={{
              backgroundColor: verdictStyle.bg,
              boxShadow: verdictStyle.shadow,
              color: verdictStyle.textColor,
            }}
          >
            <span className="font-comic text-2xl">{analysis.recommendation}</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isActive && !analysis && (
        <div className="py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="loading-dot bg-comic-yellow" />
            <div className="loading-dot bg-comic-yellow" />
            <div className="loading-dot bg-comic-yellow" />
          </div>
          <p className="font-comic text-comic-yellow text-lg">JUDGING THE BATTLE...</p>
          <p className="text-sm text-gray-500 mt-2">Analyzing both sides</p>
        </div>
      )}

      {/* Analysis Content */}
      {analysis && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-comic-yellow/10 border-2 border-comic-yellow p-5">
            <p className="text-gray-200 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Key Factors */}
          {analysis.arguments.length > 0 && (
            <div>
              <p className="font-comic text-sm text-comic-yellow uppercase mb-4">
                Key Deciding Factors
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.arguments.map((arg, idx) => (
                  <div
                    key={idx}
                    className="relative bg-comic-bg-dark border-2 border-gray-700 p-4 hover:border-comic-yellow transition-colors h-[160px] overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-comic-yellow border-2 border-black flex items-center justify-center flex-shrink-0 text-xs font-bold text-black">
                        {idx + 1}
                      </div>
                      <p className="font-bold text-white text-sm">{arg.point}</p>
                    </div>
                    <p className="text-xs text-gray-400 pr-12">{arg.evidence}</p>
                    <div className="absolute bottom-3 right-3">
                      <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="15" fill="none" stroke="#374151" strokeWidth="5" />
                          <circle
                            cx="20" cy="20" r="15" fill="none" stroke="#ffd93d" strokeWidth="5"
                            strokeDasharray={`${arg.confidence * 94.2} 94.2`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-comic-yellow">
                          {(arg.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confidence Footer */}
          <div className="flex items-center justify-center pt-4 border-t-2 border-gray-700">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 font-bold uppercase">Verdict Confidence</span>
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#374151" strokeWidth="6" />
                  <circle
                    cx="28" cy="28" r="22" fill="none" stroke="#ffd93d" strokeWidth="6"
                    strokeDasharray={`${analysis.confidence_score * 138.2} 138.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-comic text-sm text-comic-yellow">
                  {(analysis.confidence_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Sources */}
          {analysis.sources && analysis.sources.length > 0 && (
            <div className="pt-4 border-t-2 border-gray-700">
              <p className="font-comic text-xs text-gray-500 uppercase mb-3">
                Sources Used
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`comic-chip text-xs ${
                      source.url
                        ? 'bg-comic-bg-secondary text-gray-300 hover:bg-comic-purple hover:text-white'
                        : 'bg-gray-800 text-gray-500 cursor-default'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        source.type === 'stock_data' ? 'bg-comic-blue' : 'bg-comic-green'
                      }`}
                    />
                    {source.name.length > 40 ? source.name.slice(0, 40) + '...' : source.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isActive && !analysis && (
        <div className="py-12 text-center">
          <p className="font-comic text-gray-500">AWAITING DEBATE CONCLUSION...</p>
        </div>
      )}
    </div>
  );
}
