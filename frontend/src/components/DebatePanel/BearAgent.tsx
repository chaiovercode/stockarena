import { AgentAnalysis } from '../../types';

interface BearAgentProps {
  analysis: AgentAnalysis | null;
  isActive: boolean;
  roundNumber?: number;
}

export function BearAgent({ analysis, isActive, roundNumber }: BearAgentProps) {
  return (
    <div
      className={`comic-panel p-6 transition-all duration-300 h-full ${
        isActive
          ? 'border-comic-red shadow-comic-red animate-pulse-glow'
          : analysis
          ? 'border-comic-red-dark'
          : ''
      }`}
      style={{
        background: analysis || isActive
          ? 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(15, 15, 35, 1) 100%)'
          : undefined,
        '--border-color': isActive || analysis ? '#ee5a5a' : '#000',
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-comic text-2xl text-comic-red">BEAR</h3>
          <p className="text-xs text-gray-400 font-bold uppercase">
            {roundNumber && roundNumber > 1 ? `Round ${roundNumber}` : 'Bearish Case'}
          </p>
        </div>
        {analysis && (
          <div className="comic-chip bg-comic-red text-white shadow-comic-red">
            <span className="font-bold">{(analysis.confidence_score * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isActive && !analysis && (
        <div className="py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="loading-dot bg-comic-red" />
            <div className="loading-dot bg-comic-red" />
            <div className="loading-dot bg-comic-red" />
          </div>
          <p className="font-comic text-comic-red text-lg">ATTACKING BULL CASE...</p>
          <p className="text-sm text-gray-500 mt-2">Finding reasons to SELL</p>
        </div>
      )}

      {/* Analysis Content */}
      {analysis && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-comic-red/20 border-2 border-comic-red p-4 h-[120px] overflow-y-auto">
            <p className="text-sm text-gray-200 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Arguments */}
          {analysis.arguments.length > 0 && (
            <div className="space-y-3">
              <p className="font-comic text-sm text-comic-yellow uppercase">
                Key Concerns
              </p>
              {analysis.arguments.map((arg, idx) => (
                <div
                  key={idx}
                  className="relative bg-comic-bg-dark border-2 border-gray-700 p-4 hover:border-comic-red transition-colors h-[160px] overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-comic-red border-2 border-black flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0 pr-12">
                      <p className="font-bold text-white mb-1">{arg.point}</p>
                      <p className="text-xs text-gray-400">{arg.evidence}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="15" fill="none" stroke="#374151" strokeWidth="5" />
                        <circle
                          cx="20" cy="20" r="15" fill="none" stroke="#ff6b6b" strokeWidth="5"
                          strokeDasharray={`${arg.confidence * 94.2} 94.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-comic-red">
                        {(arg.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isActive && !analysis && (
        <div className="py-12 text-center">
          <p className="font-comic text-gray-500">WAITING FOR BULL...</p>
        </div>
      )}
    </div>
  );
}
