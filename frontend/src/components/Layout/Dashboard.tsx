import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { TickerSearch } from '../SearchBar/TickerSearch';
import { DebatePanel } from '../DebatePanel/DebatePanel';
import { PriceChart } from '../StockCharts/PriceChart';
import { MetricsCard } from '../StockCharts/MetricsCard';
import { TickerTape } from '../TickerTape/TickerTape';
import { ResearchPanel } from '../Research/ResearchPanel';
import { useDebate } from '../../hooks/useDebate';

export function Dashboard() {
  const { state, isConnected, startDebate, reset } = useDebate();
  const { phase, stockData, error } = state;

  const isLoading = [
    'connecting',
    'fetching',
    'summarizing',
    'bull_analyzing',
    'bear_analyzing',
    'moderating',
  ].includes(phase);

  return (
    <div className="min-h-screen bg-stock-bg">
      {/* Ticker Tape */}
      <TickerTape />

      {/* Header */}
      <header>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                <span className="text-stock-primary">Stock</span>
                <span className="text-white">Arena</span>
              </h1>
              <p className="text-xs text-stock-text-secondary">
                AI-powered stock analysis with multi-perspective debate
              </p>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center gap-4">
              {/* New Analysis Button */}
              {phase !== 'idle' && (
                <button
                  onClick={reset}
                  className="stock-btn-primary px-4 py-2 flex items-center gap-2 text-sm"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  New Analysis
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
            <div className="stock-card bg-stock-danger/10 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-stock-danger rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl text-white font-bold">!</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-stock-danger mb-2">Error</h3>
                  <p className="text-stock-text-primary">{error}</p>
                  <button
                    onClick={reset}
                    className="mt-4 stock-btn px-4 py-2 text-sm"
                  >
                    Try Again
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

        {/* Research Panel */}
        {stockData && (
          <section className="mb-8 animate-fade-in">
            <ResearchPanel
              newsItems={state.newsItems || []}
              ticker={state.ticker}
              isLoading={isLoading && (phase === 'fetching' || phase === 'summarizing')}
              summaryAnalysis={state.summaryAnalysis || null}
              marketData={state.marketData || null}
            />
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
            <div className="stock-card p-8 md:p-12">
              <div className="text-center">
                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  AI-Powered Stock Analysis
                </h2>
                <p className="text-stock-text-secondary max-w-2xl mx-auto mb-12 text-base">
                  Enter a stock ticker to get comprehensive analysis from multiple AI perspectives.
                  Our system analyzes both bullish and bearish scenarios to provide balanced insights.
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="stock-card p-6 bg-stock-bg-panel">
                    <div className="w-12 h-12 bg-stock-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-stock-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="font-semibold text-white text-base mb-2">Real-Time Data</div>
                    <p className="text-sm text-stock-text-secondary">Live stock data and market metrics</p>
                  </div>
                  <div className="stock-card p-6 bg-stock-bg-panel">
                    <div className="w-12 h-12 bg-stock-success/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-stock-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="font-semibold text-white text-base mb-2">Multi-Agent Analysis</div>
                    <p className="text-sm text-stock-text-secondary">AI agents debate different perspectives</p>
                  </div>
                  <div className="stock-card p-6 bg-stock-bg-panel">
                    <div className="w-12 h-12 bg-stock-warning/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-stock-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="font-semibold text-white text-base mb-2">Final Verdict</div>
                    <p className="text-sm text-stock-text-secondary">Clear, actionable recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stock-bg-secondary mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-center text-sm text-stock-text-muted">
            Powered by <span className="text-stock-primary font-medium">LangGraph</span>, <span className="text-stock-info font-medium">CrewAI</span> & <span className="text-stock-success font-medium">OpenAI</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
