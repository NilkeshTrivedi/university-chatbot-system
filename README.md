# AdmissAI 🎓
### Your AI-powered college admissions counselor — available 24/7

> Built for students who want real, school-specific guidance — not generic advice.

---

## What is AdmissAI?

Getting into a top university is one of the most stressful things a student can go through. The requirements are complex, the deadlines sneak up on you, and generic advice from the internet only gets you so far.

**AdmissAI** is a web app that acts like a personal admissions counselor. It knows the actual requirements for 8 of the world's most competitive programs — and it lets you have a real conversation about your application through an AI chat powered by Groq.

No signup. No payment. Just open it and start asking questions.

---

## Features

### 💬 AI Chat Advisor
Chat with an AI that actually knows what each university is looking for. Select a program from the sidebar and ask anything — "Is my GPA good enough?", "What should my MIT essay be about?", "How important are extracurriculars for Stanford?"

The AI answers based on real program data, not generic internet advice.

### 🏛️ Program Explorer
Browse 8 top programs with full details — acceptance rates, GPA ranges, SAT/ACT scores, essay requirements, deadlines, tips, and common mistakes to avoid.

| University | Program | Acceptance Rate |
|---|---|---|
| MIT | Computer Science (B.S.) | 3.9% |
| Stanford | Computer Science (B.S.) | 3.7% |
| Harvard | Pre-Medicine / Biological Sciences | 3.4% |
| Wharton (UPenn) | Business Economics & Management | 6.5% |
| CMU | Computer Science (B.S.) | 4.6% |
| Oxford | Law (BA/LLB) | 12% |
| Columbia | Economics (B.A.) | 3.9% |
| Caltech | Physics (B.S.) | 2.9% |

### ✅ Application Checklist
Every program comes with a complete checklist — essays, recommendations, tests, fees — organized by category. Check off tasks as you complete them. Progress saves automatically in your browser.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, Flask-CORS |
| AI | Groq API (llama-3.3-70b-versatile) |
| Frontend | Vanilla HTML, CSS, JavaScript |
| Fonts | Fraunces (display), DM Sans (body) |
| Icons | Font Awesome 6 |
| Environment | python-dotenv |

No database. No heavy framework. Intentionally kept simple and fast.

---

## Getting Started

### Prerequisites
- Python 3.8+
- A free Groq API key from [console.groq.com](https://console.groq.com)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/admissai.git
cd admissai
```

**2. Install dependencies**
```bash
pip install flask flask-cors python-dotenv requests
```

**3. Set up your environment**
```bash
cp .env.example .env
```

Open `.env` and add your Groq API key:
```env
GROQ_API_KEY=gsk_your_actual_key_here
FLASK_DEBUG=1
PORT=5000
```

**4. Run the app**
```bash
python app.py
```

Open your browser at **http://localhost:5000** and you're good to go.

---

## Project Structure

```
admissai/
│
├── app.py                      # Flask app entry point
│
├── routes/
│   ├── chat.py                 # POST /api/chat
│   ├── programs.py             # GET /api/programs, /api/programs/<id>
│   ├── checklist.py            # GET /api/checklist/<id>
│   └── compress.py             # POST /api/compress
│
├── services/
│   ├── ai_service.py           # Groq API integration
│   ├── compression.py          # Text compression (Groq-powered)
│   └── admissions_data.py      # All university program data
│
├── templates/
│   └── index.html              # Single page app shell
│
├── static/
│   ├── css/main.css            # All styles
│   └── js/
│       ├── app.js              # Routing + global state
│       ├── programs.js         # Program explorer
│       ├── chat.js             # Chat interface
│       └── checklist.js        # Checklist with localStorage
│
├── .env.example
├── requirements.txt
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check |
| GET | `/api/programs` | List all programs (supports `?q=` and `?category=`) |
| GET | `/api/programs/<id>` | Full details for one program |
| POST | `/api/chat` | Send message to AI, get response |
| GET | `/api/checklist/<id>` | Get checklist for a program |
| POST | `/api/compress` | Compress any text |

---

## How the AI Works

When you select a program in the chat sidebar, the app pulls that program's full requirements from `admissions_data.py`, compresses it to reduce token usage, and injects it into the AI's system prompt. This means the AI answers with accurate, school-specific information — not guesswork.

```
You select MIT CS in sidebar
        ↓
app fetches MIT requirements from admissions_data.py
        ↓
text gets compressed (saves tokens)
        ↓
compressed data injected into Groq system prompt
        ↓
you ask "what GPA do I need?" → AI answers with actual MIT data
```

Without a program selected, the AI answers general admissions questions from its training knowledge.

---

## Known Limitations

- Program data is hardcoded — no live sync with university websites
- Chat history resets on page refresh (no user accounts)
- 8 programs only for now — more coming later
- Always verify final requirements on the official university website before applying

---

## Contributing

Pull requests are welcome. If you want to add a new university program, just add it to `services/admissions_data.py` following the existing format.

---

## License

MIT License — do whatever you want with it.

---

*Built as a side project to make the college admissions process a little less overwhelming.*