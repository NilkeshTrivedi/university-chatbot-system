# AdmissAI – College Admissions Assistant 🎓

hey! so this is my project for helping students figure out the whole college admissions process. it's basically an AI chatbot that knows about top university programs and can answer your questions about requirements, essays, deadlines, etc.

i built it using Flask (Python) for the backend and vanilla JS + HTML/CSS for the frontend. no React or anything fancy, just kept it simple.

---

## what it does

- **Programs Explorer** – browse 8 top university programs (MIT, Stanford, Harvard, Wharton, CMU, Oxford, Columbia, Caltech) with all their requirements
- **AI Chat** – ask questions and get answers specific to whatever program you're looking at. uses Google Gemini under the hood
- **Application Checklist** – interactive to-do list for each program so you don't miss anything. saves your progress automatically
- **Compression Stats** – uses Scaledown to compress program context before sending it to the AI (saves tokens = saves money basically)

---

## tech stack

- **Backend:** Python, Flask, Flask-CORS
- **AI:** Google Gemini API (gemini-2.0-flash)
- **Compression:** Scaledown API (falls back to a basic version if not configured)
- **Frontend:** plain HTML, CSS, JavaScript — no framework
- **Fonts/Icons:** Google Fonts (Inter, Playfair Display), Font Awesome

---

## how to run it locally

### step 1 – clone the repo
```bash
git clone <your-repo-url>
cd university-chatbot
```

### step 2 – install dependencies
```bash
pip install flask flask-cors python-dotenv google-generativeai requests
```

> ⚠️ if `scaledown` isn't installing, just skip it. the app has a fallback built in and works fine without it.

### step 3 – set up your .env file

copy the example file and fill it in:
```bash
cp .env.example .env
```

then open `.env` and replace the placeholder values:
```
GEMINI_API_KEY=your-actual-key-here
SCALEDOWN_API_KEY=your-scaledown-key-here   # optional
FLASK_DEBUG=1
PORT=5000
```

you can get a **free** Gemini API key from: https://aistudio.google.com/app/apikey  
just sign in with a Google account and create a key, takes like 2 minutes

### step 4 – run it
```bash
python app.py
```

then open your browser and go to: **http://localhost:5000**

that's it!

---

## project structure

```
university-chatbot/
│
├── app.py                  # main Flask app, registers all blueprints
│
├── routes/
│   ├── chat.py             # /api/chat endpoint
│   ├── programs.py         # /api/programs endpoints
│   ├── compress.py         # /api/compress endpoint
│   └── checklist.py        # /api/checklist endpoint
│
├── services/
│   ├── ai_service.py       # Gemini API calls + fallback responses
│   ├── compression.py      # Scaledown wrapper + fallback compressor
│   └── admissions_data.py  # all the university program data (hardcoded for now)
│
├── static/
│   ├── css/main.css        # all styles
│   └── js/
│       ├── app.js          # routing + global state + toast notifications
│       ├── dashboard.js    # dashboard page logic
│       ├── programs.js     # programs grid + detail drawer
│       ├── chat.js         # chat UI + message rendering
│       └── checklist.js    # checklist with localStorage persistence
│
├── templates/
│   └── index.html          # single HTML file (SPA)
│
├── requirements.txt
├── .env.example
└── .gitignore
```

---

## API endpoints

| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/api/health` | check if server is running |
| GET | `/api/programs` | list all programs (supports `?q=` search and `?category=` filter) |
| GET | `/api/programs/<id>` | get full details for one program |
| POST | `/api/chat` | send a message to the AI |
| GET | `/api/checklist/<id>` | get checklist items for a program |
| POST | `/api/compress` | compress any text using Scaledown |

---

## known issues / things i want to fix

- [ ] program data is all hardcoded in `admissions_data.py` — would be better with a real database
- [ ] no user accounts so chat history resets on refresh
- [ ] only 8 programs right now, want to add more
- [ ] mobile layout for chat page hides the sidebar (have to scroll past it)
- [ ] the Gemini free tier has rate limits so it might be slow sometimes

---

## if something breaks

**"ModuleNotFoundError: No module named flask"**  
→ you forgot to install dependencies. run `pip install -r requirements.txt`

**AI chat just says demo responses and doesn't use Gemini**  
→ your `GEMINI_API_KEY` in `.env` is probably still the placeholder value. replace it with your actual key.

**getting 500 errors from the API**  
→ set `FLASK_DEBUG=1` in your `.env` and check the terminal — it'll show the actual error

---

## acknowledgements

built this as a side project to learn Flask and experiment with LLM APIs. the Scaledown integration was interesting to work with for reducing token costs when injecting context into prompts.

if you want to use this or build on top of it, feel free!