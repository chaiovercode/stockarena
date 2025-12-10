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
      case 'bull_analyzing':
        return 30 + (currentRound - 1) * 20;
      case 'bear_analyzing':
        return 55 + (currentRound - 1) * 15;
      case 'moderating':
        return 85;
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
        return 'CONNECTING...';
      case 'fetching':
        return 'FETCHING DATA...';
      case 'bull_analyzing':
        return `BULL IS FIGHTING${maxRounds > 1 ? ` (ROUND ${currentRound}/${maxRounds})` : ''}`;
      case 'bear_analyzing':
        return `BEAR IS ATTACKING${maxRounds > 1 ? ` (ROUND ${currentRound}/${maxRounds})` : ''}`;
      case 'moderating':
        return 'JUDGE IS DECIDING...';
      case 'complete':
        return 'BATTLE COMPLETE!';
      case 'error':
        return 'ERROR';
      default:
        return 'READY';
    }
  };

  const phases = [
    { key: 'data', label: 'DATA', icon: '1' },
    { key: 'bull', label: 'BULL', icon: '2' },
    { key: 'bear', label: 'BEAR', icon: '3' },
    { key: 'verdict', label: 'VERDICT', icon: '4' },
  ];

  const getPhaseStatus = (phaseKey: string) => {
    const phaseOrder = ['fetching', 'bull_analyzing', 'bear_analyzing', 'moderating', 'complete'];
    const currentIndex = phaseOrder.indexOf(phase);

    switch (phaseKey) {
      case 'data':
        return currentIndex >= 1 ? 'completed' : phase === 'fetching' ? 'active' : 'pending';
      case 'bull':
        return currentIndex >= 2 ? 'completed' : phase === 'bull_analyzing' ? 'active' : 'pending';
      case 'bear':
        return currentIndex >= 3 ? 'completed' : phase === 'bear_analyzing' ? 'active' : 'pending';
      case 'verdict':
        return phase === 'complete' ? 'completed' : phase === 'moderating' ? 'active' : 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <div className="comic-panel p-6">
        {/* Phase Label */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-comic text-xl text-comic-yellow">{getPhaseLabel()}</h3>
          <span className="font-comic text-lg text-white">{getPhaseProgress()}%</span>
        </div>

        {/* Phase Indicators - Progress Bar with Milestones */}
        <div className="relative pt-2 pb-2">
          {/* Background Line */}
          <div className="absolute top-6 left-4 right-4 h-1 bg-gray-700" />

          {/* Progress Line */}
          <div
            className="absolute top-6 left-4 h-1 transition-all duration-500"
            style={{
              backgroundColor: '#9775fa',
              width: phase === 'complete' ? 'calc(100% - 32px)'
                : phase === 'moderating' ? 'calc(83% - 26px)'
                : phase === 'bear_analyzing' ? 'calc(50% - 16px)'
                : phase === 'bull_analyzing' ? 'calc(17% - 6px)'
                : '0%'
            }}
          />

          {/* Milestone Circles */}
          <div className="relative flex justify-between">
            {phases.map((p) => {
              const status = getPhaseStatus(p.key);
              return (
                <div key={p.key} className="flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all"
                    style={{
                      backgroundColor: status === 'completed' ? '#9775fa'
                        : status === 'active' ? '#ffd93d'
                        : '#374151',
                      border: status === 'completed' ? '2px solid #9775fa'
                        : status === 'active' ? '2px solid #ffd93d'
                        : '2px solid #4b5563'
                    }}
                  >
                    {status === 'completed' && (
                      <svg className="w-4 h-4" fill="#fff" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className="mt-3 text-xs font-bold uppercase"
                    style={{
                      color: status === 'completed' ? '#9775fa'
                        : status === 'active' ? '#ffd93d'
                        : '#6b7280'
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

      {/* Battle Arena - Bull vs Bear */}
      <div className="relative">
        {/* VS Badge in center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:block">
          <div className="vs-badge">VS</div>
        </div>

        {/* Fighters Grid */}
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
