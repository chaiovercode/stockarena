# Stock Arena

AI-powered stock analysis platform with Bull vs Bear debate format for Indian markets (NSE/BSE).

## Features

- Real-time Bull vs Bear AI debate on any stock
- Multiple time horizons (Short/Medium/Long term)
- Live ticker tape with Nifty 50 stocks
- Comprehensive stock metrics with explanations
- Analyst recommendations & shareholding patterns

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: FastAPI + WebSockets + CrewAI + LangGraph
- **AI**: OpenAI GPT-4o-mini

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add your OPENAI_API_KEY
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Railway Deployment

1. Create a new project on [Railway](https://railway.app)
2. Create two services from this repo:
   - **Backend**: Set root directory to `backend`
   - **Frontend**: Set root directory to `frontend`
3. Add environment variables:
   - Backend: `OPENAI_API_KEY`
   - Frontend: `VITE_API_URL` (your backend URL)
4. Deploy!

## Environment Variables

### Backend
- `OPENAI_API_KEY` (required): Your OpenAI API key

### Frontend  
- `VITE_API_URL`: Backend API URL (for production)

## License

MIT
