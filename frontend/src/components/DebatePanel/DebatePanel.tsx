import { DebateState } from '../../types';
import { BullAgent } from './BullAgent';
import { BearAgent } from './BearAgent';
import { ModeratorAgent } from './ModeratorAgent';

interface DebatePanelProps {
  state: DebateState;
}

export function DebatePanel({ state }: DebatePanelProps) {
  const {
    phase,
    currentRound,
    maxRounds,
    bullAnalysis,
    bearAnalysis,
    moderatorAnalysis,
  } = state;

  const getPhaseProgress = () => {
    switch (phase) {
      case 'connecting':
        return 5;
      case 'fetching':
        return 15;
      case 'summarizing':
        return 25;
      case 'bull_analyzing':
        return 35 + (currentRound - 1) * 20;
      case 'bear_analyzing':
        return 60 + (currentRound - 1) * 15;
      case 'moderating':
        return 90;
      case 'complete':
        return 100;
      case 'error':
        return 0;
      default:
        return 0;
    }
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case 'connecting':
        return 'Connecting...';
      case 'fetching':
        return 'Fetching Data...';
      case 'summarizing':
        return 'Analyzing Market Context...';
      case 'bull_analyzing':
        return `Bullish Analysis${maxRounds > 1 ? ` (Round ${currentRound}/${maxRounds})` : ''}`;
      case 'bear_analyzing':
        return `Bearish Analysis${maxRounds > 1 ? ` (Round ${currentRound}/${maxRounds})` : ''}`;
      case 'moderating':
        return 'Final Analysis...';
      case 'complete':
        return 'Analysis Complete';
      case 'error':
        return 'Error';
      default:
        return 'Ready';
    }
  };

  const phases = [
    { key: 'data', label: 'Data', icon: '1' },
    { key: 'summary', label: 'Summary', icon: '2' },
    { key: 'bull', label: 'Bullish', icon: '3' },
    { key: 'bear', label: 'Bearish', icon: '4' },
    { key: 'verdict', label: 'Verdict', icon: '5' },
  ];

  const getPhaseStatus = (phaseKey: string) => {
    const phaseOrder = ['fetching', 'summarizing', 'bull_analyzing', 'bear_analyzing', 'moderating', 'complete'];
    const currentIndex = phaseOrder.indexOf(phase);

    switch (phaseKey) {
      case 'data':
        return currentIndex >= 1 ? 'completed' : phase === 'fetching' ? 'active' : 'pending';
      case 'summary':
        return currentIndex >= 2 ? 'completed' : phase === 'summarizing' ? 'active' : 'pending';
      case 'bull':
        return currentIndex >= 3 ? 'completed' : phase === 'bull_analyzing' ? 'active' : 'pending';
      case 'bear':
        return currentIndex >= 4 ? 'completed' : phase === 'bear_analyzing' ? 'active' : 'pending';
      case 'verdict':
        return phase === 'complete' ? 'completed' : phase === 'moderating' ? 'active' : 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <div className="stock-card p-5 relative overflow-hidden">
        {/* Phase Label */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#5b8ef4] animate-pulse" />
            <h3 className="text-base font-semibold text-stock-primary">
              {getPhaseLabel()}
            </h3>
          </div>

          {/* Percentage Display */}
          <span className="text-sm font-medium text-white">{getPhaseProgress()}%</span>
        </div>

        {/* Phase Indicators - Progress Track */}
        <div className="relative pt-2 pb-1">
          {/* Background Track */}
          <div className="absolute top-5 left-4 right-4 h-1 bg-[#2a2e39] rounded-full" />

          {/* Progress Fill */}
          <div
            className="absolute top-5 left-4 h-1 transition-all duration-500 rounded-full bg-gradient-to-r from-[#5b8ef4] to-[#2962ff]"
            style={{
              width: phase === 'complete' ? 'calc(100% - 32px)'
                : phase === 'moderating' ? 'calc(80% - 26px)'
                : phase === 'bear_analyzing' ? 'calc(60% - 20px)'
                : phase === 'bull_analyzing' ? 'calc(40% - 14px)'
                : phase === 'summarizing' ? 'calc(20% - 8px)'
                : '0%'
            }}
          />

          {/* Milestone Circles */}
          <div className="relative flex justify-between">
            {phases.map((p, index) => {
              const status = getPhaseStatus(p.key);
              return (
                <div key={p.key} className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300"
                    style={{
                      background: status === 'completed' || status === 'active'
                        ? 'linear-gradient(135deg, #5b8ef4 0%, #2962ff 100%)'
                        : '#2a2e39',
                      border: status === 'completed' || status === 'active'
                        ? '2px solid rgba(91, 142, 244, 0.3)'
                        : '2px solid #363a45'
                    }}
                  >
                    {status === 'completed' ? (
                      <svg className="w-4 h-4" fill="#fff" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : status === 'active' ? (
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    ) : (
                      <span className="text-xs font-semibold text-[#787b86]">{index + 1}</span>
                    )}
                  </div>

                  <span
                    className="mt-2 text-xs font-medium transition-all"
                    style={{
                      color: status === 'completed' || status === 'active' ? '#5b8ef4' : '#787b86'
                    }}
                  >
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Analysis Panels - Bull vs Bear */}
      <div className="relative">
        {/* Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="animate-slide-left h-full">
            <BullAgent
              analysis={bullAnalysis}
              isActive={phase === 'bull_analyzing'}
              roundNumber={currentRound}
            />
          </div>
          <div className="animate-slide-right h-full">
            <BearAgent
              analysis={bearAnalysis}
              isActive={phase === 'bear_analyzing'}
              roundNumber={currentRound}
            />
          </div>
        </div>
      </div>

      {/* Moderator Verdict */}
      {(phase === 'moderating' || phase === 'complete' || moderatorAnalysis) && (
        <div className="animate-fade-in">
          <ModeratorAgent
            analysis={moderatorAnalysis}
            isActive={phase === 'moderating'}
          />
        </div>
      )}
    </div>
  );
}
