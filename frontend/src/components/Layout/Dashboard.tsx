import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { TickerSearch } from '../SearchBar/TickerSearch';
import { DebatePanel } from '../DebatePanel/DebatePanel';
import { PriceChart } from '../StockCharts/PriceChart';
import { MetricsCard } from '../StockCharts/MetricsCard';
import { TickerTape } from '../TickerTape/TickerTape';
import { useDebate } from '../../hooks/useDebate';

export function Dashboard() {
  const { state, isConnected, startDebate, reset } = useDebate();
  const { phase, stockData, error } = state;

  const isLoading = [
    'connecting',
    'fetching',
    'bull_analyzing',
    'bear_analyzing',
    'moderating',
  ].includes(phase);

  return (
    <div className="min-h-screen bg-comic-bg">
      {/* Ticker Tape */}
      <TickerTape />

      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div>
              <h1 className="font-comic text-4xl md:text-5xl tracking-wide">
                <span className="text-comic-yellow">STOCK</span>
                <span className="text-white ml-2">ARENA</span>
              </h1>
              <p className="text-xs text-gray-400 mt-1 max-w-lg">
                AI-powered stock analysis through debate. Bull argues for buying, Bear counters with risks. After multiple rounds, a Judge delivers the verdict.
              </p>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center gap-4">
              {/* New Analysis Button */}
              {phase !== 'idle' && (
                <button
                  onClick={reset}
                  className="comic-btn bg-comic-yellow text-black px-4 py-2 flex items-center gap-2"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  NEW
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Section */}
        <section className="mb-8 animate-fade-in">
          <TickerSearch onSearch={startDebate} isLoading={isLoading} />
        </section>

        {/* Error Display */}
        {error && (
          <section className="mb-8 animate-fade-in">
            <div className="comic-panel bg-comic-red/20 border-comic-red p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-comic-red border-3 border-black shadow-comic-sm flex items-center justify-center flex-shrink-0">
                  <span className="font-comic text-2xl text-white">!</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-comic text-xl text-comic-red mb-2">ERROR!</h3>
                  <p className="text-gray-300">{error}</p>
                  <button
                    onClick={reset}
                    className="mt-4 comic-btn bg-comic-red text-white px-4 py-2"
                  >
                    TRY AGAIN
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stock Data Visualization */}
        {stockData && (
          <section className="mb-8 space-y-6 animate-fade-in">
            <MetricsCard stockData={stockData} />
            <PriceChart stockData={stockData} />
          </section>
        )}

        {/* Debate Panel */}
        {phase !== 'idle' && phase !== 'error' && (
          <section className="animate-fade-in">
            <DebatePanel state={state} />
          </section>
        )}

        {/* Welcome State */}
        {phase === 'idle' && (
          <section className="animate-fade-in">
            <div className="comic-panel p-8 md:p-12">
              <div className="text-center">
                {/* Title */}
                <h2 className="font-comic text-4xl md:text-5xl mb-4">
                  <span className="text-comic-yellow">STOCK</span>{' '}
                  <span className="text-white">SHOWDOWN</span>
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto mb-8 text-lg">
                  Enter a stock ticker to watch AI agents battle it out!
                  Bull vs Bear - who will win?
                </p>

                {/* Battle Preview */}
                <div className="flex justify-center items-center gap-6 md:gap-12">
                  {/* Bull */}
                  <div className="text-center animate-slide-left">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-comic-green border-3 border-black shadow-comic flex items-center justify-center">
                      <span className="font-comic text-white text-2xl md:text-3xl">BULL</span>
                    </div>
                  </div>

                  {/* VS */}
                  <div className="vs-badge animate-pulse-glow">VS</div>

                  {/* Bear */}
                  <div className="text-center animate-slide-right">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-comic-red border-3 border-black shadow-comic flex items-center justify-center">
                      <span className="font-comic text-white text-2xl md:text-3xl">BEAR</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
                  <div className="comic-panel p-4 bg-comic-bg-secondary">
                    <div className="font-comic text-comic-yellow text-lg mb-1">REAL DATA</div>
                    <p className="text-sm text-gray-400">Live stock data from Yahoo Finance</p>
                  </div>
                  <div className="comic-panel p-4 bg-comic-bg-secondary">
                    <div className="font-comic text-comic-yellow text-lg mb-1">AI DEBATE</div>
                    <p className="text-sm text-gray-400">Agents argue with real evidence</p>
                  </div>
                  <div className="comic-panel p-4 bg-comic-bg-secondary">
                    <div className="font-comic text-comic-yellow text-lg mb-1">VERDICT</div>
                    <p className="text-sm text-gray-400">Get actionable recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-3 border-black mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-center text-sm text-gray-500 font-medium">
            Powered by <span className="text-comic-yellow">LangGraph</span> + <span className="text-comic-blue">CrewAI</span> + <span className="text-comic-green">OpenAI</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
