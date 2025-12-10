# Stock Arena

AI-powered stock analysis platform where Bull and Bear agents debate investment merits before a Judge delivers the final verdict.

## Overview

Stock Arena uses a multi-agent AI system to analyze stocks from opposing perspectives:

- **Bull Agent**: Argues the bullish case - growth potential, positive catalysts, and reasons to buy
- **Bear Agent**: Counters with risks, concerns, valuation issues, and reasons for caution
- **Moderator (Judge)**: Synthesizes both perspectives and delivers a balanced verdict

The debate happens in real-time over WebSocket, with live stock data from Yahoo Finance and recent news context.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│              React + TypeScript + Tailwind                   │
│                    (Port 5173)                               │
└─────────────────────┬───────────────────────────────────────┘
                      │ WebSocket
┌─────────────────────▼───────────────────────────────────────┐
│                        Backend                               │
│                  FastAPI + LangGraph                         │
│                    (Port 8000)                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐    ┌─────────┐    ┌────────────┐              │
│  │  Bull   │◄──►│  Bear   │◄──►│ Moderator  │              │
│  │  Agent  │    │  Agent  │    │   Agent    │              │
│  └────┬────┘    └────┬────┘    └─────┬──────┘              │
│       │              │               │                      │
│       └──────────────┴───────────────┘                      │
│                      │                                       │
│              ┌───────▼───────┐                              │
│              │   LangGraph   │                              │
│              │  State Machine│                              │
│              └───────────────┘                              │
├─────────────────────────────────────────────────────────────┤
│  Data Sources:                                              │
│  • Yahoo Finance (yfinance) - Stock data & metrics          │
│  • DuckDuckGo (ddgs) - Recent news search                   │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Backend
- **FastAPI** - High-performance async web framework
- **LangGraph** - Orchestrates the multi-agent debate flow
- **CrewAI** - Provides the agent framework
- **OpenAI GPT** - Powers the AI agents
- **yfinance** - Real-time stock data from Yahoo Finance
- **DuckDuckGo Search** - News and sentiment context

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling (comic book theme)
- **Tremor** - Charts and data visualization
- **WebSocket** - Real-time debate streaming

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- OpenAI API Key

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd stockarena
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-your-key-here
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### 4. Configure Environment

Edit `backend/.env`:

```env
OPENAI_API_KEY=sk-proj-your-openai-api-key
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
DEBUG=true
LOG_LEVEL=INFO
```

## Running the Application

### Option 1: Run Both Services (Recommended)

From the project root directory:

```bash
# Kill any existing server on port 8000, then start both services
lsof -ti:8000 | xargs kill -9 2>/dev/null || true && \
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000 --host 0.0.0.0 & \
cd frontend && npm run dev
```

### Option 2: Run Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 3: Docker Compose

```bash
# Create .env file in project root with your API keys
docker-compose up --build
```

## Accessing the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Usage

1. Open http://localhost:5173 in your browser
2. Enter a stock ticker (e.g., `TATASTEEL`, `RELIANCE`, `TCS` for NSE)
3. Select exchange (NSE/BSE)
4. Choose time horizon (Short-term, Medium-term, Long-term)
5. Set number of debate rounds (1-3)
6. Click "Start Battle" and watch the AI agents debate!

## Features

- **Real-time Debate**: Watch Bull and Bear agents argue in real-time via WebSocket
- **Multi-round Debates**: Configure 1-3 rounds for deeper analysis
- **Time Horizon Analysis**: Short-term (1-5 days), Medium-term (1-3 months), Long-term (1+ year)
- **Comprehensive Data**:
  - Current price, P/E, P/B, ROE, Debt/Equity
  - 52-week high/low
  - Analyst recommendations
  - Recent news sentiment
- **Interactive Charts**: Historical price visualization with Tremor
- **Confidence Scores**: Each argument comes with an AI confidence rating

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/docs` | GET | Swagger documentation |
| `/ws/debate/{session_id}` | WebSocket | Real-time debate streaming |
| `/ws/debate` | WebSocket | Auto-generated session ID |

### WebSocket Message Format

**Start Debate:**
```json
{
  "type": "start",
  "ticker": "TATASTEEL",
  "exchange": "NSE",
  "max_rounds": 1,
  "time_horizon": "medium_term"
}
```

**Response Types:**
- `started` - Debate initiated
- `data_fetched` - Stock data retrieved
- `agent_start` - Agent beginning analysis
- `agent_response` - Agent analysis complete
- `round_complete` - Debate round finished
- `complete` - Debate finished
- `error` - Error occurred

## Project Structure

```
stockarena/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── analysis.py      # REST endpoints
│   │   │   │   └── websocket.py     # WebSocket handler
│   │   │   └── schemas/             # Pydantic models
│   │   ├── core/
│   │   │   ├── agents/
│   │   │   │   ├── bull_agent.py    # Bullish analyst
│   │   │   │   ├── bear_agent.py    # Bearish analyst
│   │   │   │   └── moderator_agent.py # Judge
│   │   │   └── graph/
│   │   │       ├── builder.py       # LangGraph setup
│   │   │       ├── nodes.py         # Graph nodes
│   │   │       └── state.py         # State schema
│   │   ├── services/
│   │   │   ├── stock_service.py     # Yahoo Finance
│   │   │   └── news_service.py      # DuckDuckGo
│   │   ├── config.py                # Settings
│   │   └── main.py                  # FastAPI app
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DebatePanel/         # Bull/Bear/Moderator UI
│   │   │   ├── StockCharts/         # Price chart & metrics
│   │   │   ├── SearchBar/           # Ticker search
│   │   │   └── Layout/              # Dashboard layout
│   │   ├── hooks/
│   │   │   ├── useDebate.ts         # Debate state management
│   │   │   └── useWebSocket.ts      # WebSocket connection
│   │   └── types/                   # TypeScript types
│   ├── package.json
│   └── tailwind.config.js
├── docker-compose.yml
└── README.md
```

## Troubleshooting

### "OPENAI_API_KEY is required" Error

Make sure your `.env` file exists in `backend/` and contains a valid API key:
```bash
cd backend
cat .env  # Should show OPENAI_API_KEY=sk-...
```

### WebSocket Connection Failed

1. Ensure backend is running on port 8000
2. Check CORS_ORIGINS in `.env` includes your frontend URL
3. Check browser console for specific errors

### Port Already in Use

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Stock Data Not Loading

- Verify the ticker symbol is correct (e.g., `TATASTEEL.NS` for NSE)
- The app automatically appends `.NS` or `.BO` based on exchange selection
- Some tickers may not be available on Yahoo Finance

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key (required) | - |
| `CORS_ORIGINS` | Allowed frontend origins | `["http://localhost:5173"]` |
| `DEBUG` | Enable debug mode | `true` |
| `LOG_LEVEL` | Logging level | `INFO` |

## License

MIT

## Acknowledgments

- [LangGraph](https://github.com/langchain-ai/langgraph) - Multi-agent orchestration
- [CrewAI](https://github.com/joaomdmoura/crewAI) - Agent framework
- [yfinance](https://github.com/ranaroussi/yfinance) - Yahoo Finance data
- [Tremor](https://tremor.so) - React charts
