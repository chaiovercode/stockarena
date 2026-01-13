# Stock Arena 📈

Your personal AI stock debate analyzer. Watch a Bull and Bear agent argue about whether you should buy a stock. A Judge agent gives the final verdict.

Think of it like having two expert traders in a room arguing about a stock—one super optimistic, one super pessimistic—then a judge decides who makes more sense.

## How It Works

1. **You pick a stock** (e.g., "TATASTEEL")
2. **The app fetches live data** from Yahoo Finance
3. **Bull Agent argues**: "Why you SHOULD buy this stock"
4. **Bear Agent counters**: "Here's why you SHOULDN'T buy it"
5. **Judge decides**: "Here's my balanced take"
6. **You get a verdict** with real reasons from both sides

All three happen in real-time, streaming updates as they happen.

## What You Need

- Python 3.11+
- Node.js 18+
- OpenAI API key 

### 1. Get the code
```bash
git clone <repo-url>
cd stockarena
```

### 2. Set up the backend
```bash
cd backend

# Create isolated Python environment
python3 -m venv venv
source venv/bin/activate 

# Install dependencies
pip install -r requirements.txt

# Create .env file with your OpenAI key
echo "OPENAI_API_KEY=sk-your-key-here" > .env
echo "CORS_ORIGINS=[\"http://localhost:5173\"]" >> .env
```

### 3. Set up the frontend
```bash
cd frontend
npm install
```

### 4. Run it
```bash
# Terminal 1: Start the backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2: Start the frontend
cd frontend && npm run dev
```

Then open **http://localhost:5173** in your browser and search for a stock.

## Using It

1. Type a stock ticker like "TATASTEEL" or "RELIANCE"
2. Pick your exchange (NSE or BSE)
3. Choose how long you plan to hold (short-term, medium-term, or long-term)
4. Watch the agents debate in real-time

## What You'll See

- **Current stock price** and key metrics (P/E, debt, returns)
- **Bull's case**: 3-4 reasons to buy with confidence scores
- **Bear's case**: 3-4 reasons to be cautious with confidence scores
- **Recent news**: Context from recent articles
- **Judge's verdict**: A balanced final opinion
- **Multi-round debates** (optional): Agents can rebut each other (1-3 rounds)

## Troubleshooting

**Backend won't start?**
- Make sure you have your OpenAI API key in `.env`
- Check that Python 3.11+ is installed (`python3 --version`)

**Frontend won't load?**
- Check that both backend and frontend are running
- Try refreshing the page
- Check the browser console (F12) for errors

**Stock data not showing?**
- The ticker might not exist on Yahoo Finance
- Try NSE tickers like `TATASTEEL.NS` or `RELIANCE.NS`

**Port already in use?**
```bash
# Kill backend on port 8000
lsof -ti:8000 | xargs kill -9

# Kill frontend on port 5173
lsof -ti:5173 | xargs kill -9
```

## How It's Built

- **Python backend** uses LangGraph to orchestrate the debate workflow
- **Three AI agents** powered by OpenAI's GPT-4o (Bull, Bear, Judge)
- **Real-time streaming** over WebSocket so you see updates as they happen
- **React frontend** with TypeScript and Tailwind CSS
- **Live stock data** from Yahoo Finance
- **Recent news** from DuckDuckGo search

## License

MIT
