"""
Curated admissions data for top university programs.
Used as context for AI compression and Q&A.
"""

PROGRAMS = {
    "mit-cs": {
        "id": "mit-cs",
        "university": "Massachusetts Institute of Technology",
        "short_name": "MIT",
        "program": "Computer Science (B.S.)",
        "category": "Technology",
        "logo_color": "#A31F34",
        "acceptance_rate": "3.9%",
        "avg_gpa": "4.17",
        "avg_sat": "1570",
        "avg_act": "35",
        "application_deadline": "January 1, 2025",
        "decision_date": "March 14, 2025",
        "application_fee": "$75",
        "requirements": {
            "gpa": "Unweighted GPA of 4.0 preferred; most admitted students rank in top 1% of their class.",
            "tests": "SAT 1540-1590 or ACT 34-36. SAT Math 790-800 expected for CS applicants.",
            "essays": [
                "Personal statement: Why MIT and why CS? (500 words)",
                "Challenge essay: Describe a challenge you overcame (500 words)",
                "Activity essay: Most meaningful extracurricular (250 words)",
            ],
            "recommendations": "2 teacher recommendations (Math/Science preferred) + 1 counselor rec.",
            "extracurriculars": "Research experience, competitive programming (USACO Gold/Platinum), science olympiad, personal projects on GitHub strongly valued.",
            "interviews": "Optional alumni interview available. Highly recommended to request.",
            "international": "TOEFL iBT 90+ or IELTS 7.0+ for non-native English speakers.",
        },
        "tips": [
            "Demonstrate genuine intellectual curiosity beyond coursework.",
            "Show depth in a few activities rather than breadth across many.",
            "Highlight specific projects — GitHub repos, hackathon wins, research papers.",
            "Essays should be authentic and show your unique MIT 'mind and hand' spirit.",
            "Apply Early Action if MIT is your top choice (deadline Nov 1).",
        ],
        "common_mistakes": [
            "Generic essays that could apply to any school.",
            "Listing activities without explaining impact.",
            "Not requesting an alumni interview.",
            "Ignoring the short answer questions — they matter!",
        ],
        "checklist": [
            "Complete Common App or MIT-specific application",
            "Write personal statement (500 words)",
            "Write challenge essay (500 words)",
            "Write activity essay (250 words)",
            "Request 2 teacher recommendations",
            "Request counselor recommendation",
            "Send official SAT/ACT scores",
            "Send official high school transcript",
            "Pay $75 application fee",
            "Schedule alumni interview",
            "Submit TOEFL/IELTS scores (international students)",
        ],
    },
    "stanford-cs": {
        "id": "stanford-cs",
        "university": "Stanford University",
        "short_name": "Stanford",
        "program": "Computer Science (B.S.)",
        "category": "Technology",
        "logo_color": "#8C1515",
        "acceptance_rate": "3.7%",
        "avg_gpa": "4.18",
        "avg_sat": "1560",
        "avg_act": "35",
        "application_deadline": "January 5, 2025",
        "decision_date": "March 28, 2025",
        "application_fee": "$90",
        "requirements": {
            "gpa": "Strong academic record; most admitted students are in the top 5% of their class.",
            "tests": "Middle 50%: SAT 1500-1570, ACT 34-36. Test-optional but submitting strong scores helps.",
            "essays": [
                "Common App personal statement (650 words)",
                "Stanford short essays: 3 short essays (250 words each)",
                "What is meaningful to you and why? (100 words)",
                "How will Stanford's intellectual environment resonate with your background? (250 words)",
            ],
            "recommendations": "2 teacher recommendations + 1 counselor recommendation.",
            "extracurriculars": "Leadership roles, research, entrepreneurial projects, and community impact are highly valued.",
            "interviews": "Stanford does not offer admission interviews.",
            "international": "TOEFL iBT 89+ or IELTS 7.0+ recommended.",
        },
        "tips": [
            "Stanford wants students who make genuine, lasting impact — show what you've BUILT.",
            "The 'meaningful to you' essay is crucial — be deeply personal and specific.",
            "Intellectual vitality is key — show how you engage beyond the classroom.",
            "Demonstrate fit with specific Stanford programs, labs, or professors.",
        ],
        "common_mistakes": [
            "Treating Stanford like every other school in essays.",
            "Listing accomplishments without showing impact or meaning.",
            "Missing the intellectual vitality essays tone — be curious, not resumé-like.",
        ],
        "checklist": [
            "Complete Common App",
            "Write personal statement (650 words)",
            "Write 3 Stanford short essays (250 words each)",
            "Answer 'What is meaningful' prompt (100 words)",
            "Request 2 teacher recommendations",
            "Request counselor recommendation",
            "Send SAT/ACT scores (optional but recommended)",
            "Send official transcript",
            "Pay $90 application fee",
            "Submit arts portfolio (if applicable)",
        ],
    },
    "harvard-premed": {
        "id": "harvard-premed",
        "university": "Harvard University",
        "short_name": "Harvard",
        "program": "Pre-Medicine / Biological Sciences",
        "category": "Medicine",
        "logo_color": "#A51C30",
        "acceptance_rate": "3.4%",
        "avg_gpa": "4.19",
        "avg_sat": "1580",
        "avg_act": "36",
        "application_deadline": "January 1, 2025",
        "decision_date": "March 25, 2025",
        "application_fee": "$75",
        "requirements": {
            "gpa": "Near-perfect GPA; biology, chemistry, physics coursework required.",
            "tests": "SAT 1560-1600 or ACT 35-36. SAT Biology/Chemistry subject tests recommended.",
            "essays": [
                "Common App personal statement (650 words)",
                "Harvard supplement: Community essay (150 words)",
                "Harvard supplement: Intellectual interests (150 words)",
                "Harvard supplement: Future plans (150 words)",
            ],
            "recommendations": "2 teacher recommendations + 1 counselor + optional peer recommendation.",
            "extracurriculars": "Hospital volunteering, clinical research, lab experience, public health initiatives.",
            "interviews": "Alumni interviews requested for most applicants.",
            "international": "TOEFL iBT 100+ or IELTS 7.5+ required.",
        },
        "tips": [
            "Clinical experience is non-negotiable for pre-med at Harvard.",
            "Research publications or poster presentations significantly strengthen your application.",
            "Harvard values 'extreme promise' — show what you'll contribute to medicine.",
            "The peer recommendation (optional) is a hidden gem — use it wisely.",
        ],
        "common_mistakes": [
            "No actual clinical/hospital experience.",
            "Essays focused on grades rather than passion for medicine.",
            "Skipping the alumni interview — it is important.",
        ],
        "checklist": [
            "Complete Common App",
            "Write personal statement (650 words)",
            "Write Harvard community essay (150 words)",
            "Write Harvard intellectual interests essay (150 words)",
            "Write Harvard future plans essay (150 words)",
            "Arrange hospital volunteering documentation",
            "Request 2 teacher recommendations",
            "Request counselor recommendation",
            "Consider peer recommendation",
            "Schedule alumni interview",
            "Send official test scores",
            "Submit transcript",
            "Pay $75 application fee",
        ],
    },
    "wharton-business": {
        "id": "wharton-business",
        "university": "University of Pennsylvania – Wharton School",
        "short_name": "Wharton",
        "program": "Business Economics & Management (B.S.)",
        "category": "Business",
        "logo_color": "#011F5B",
        "acceptance_rate": "6.5%",
        "avg_gpa": "3.9",
        "avg_sat": "1540",
        "avg_act": "34",
        "application_deadline": "January 5, 2025",
        "decision_date": "March 26, 2025",
        "application_fee": "$75",
        "requirements": {
            "gpa": "3.8–4.0 unweighted; strong performance in math and economics courses.",
            "tests": "SAT 1450-1570, ACT 33-35. Math score very important.",
            "essays": [
                "Common App personal statement (650 words)",
                "UPenn supplement: Why Penn? (150-200 words)",
                "Wharton supplement: Expectations and goals at Wharton (500 words)",
            ],
            "recommendations": "2 teacher recommendations + counselor recommendation.",
            "extracurriculars": "Business competitions, entrepreneurship, investing clubs, internships, leadership roles.",
            "interviews": "Alumni interviews conducted during Regular Decision cycle.",
            "international": "TOEFL iBT 100+ required.",
        },
        "tips": [
            "Show concrete business experience — not just interest in business.",
            "The Wharton goals essay must be extremely specific to Wharton's curriculum and resources.",
            "Investment portfolios, startup ventures, or case competition wins are strong differentiators.",
        ],
        "common_mistakes": [
            "Vague career goals in the Wharton essay.",
            "Not referencing specific Wharton resources (labs, courses, clubs).",
            "Weak quantitative coursework profile.",
        ],
        "checklist": [
            "Complete Common App",
            "Write personal statement (650 words)",
            "Write 'Why Penn' essay (150-200 words)",
            "Write Wharton goals essay (500 words)",
            "Request 2 teacher recommendations",
            "Request counselor recommendation",
            "Send SAT/ACT scores",
            "Submit transcript",
            "Pay $75 application fee",
            "Participate in alumni interview",
        ],
    },
    "cmu-cs": {
        "id": "cmu-cs",
        "university": "Carnegie Mellon University",
        "short_name": "CMU",
        "program": "Computer Science (B.S.)",
        "category": "Technology",
        "logo_color": "#CC0000",
        "acceptance_rate": "4.6%",
        "avg_gpa": "4.0",
        "avg_sat": "1560",
        "avg_act": "35",
        "application_deadline": "January 2, 2025",
        "decision_date": "April 1, 2025",
        "application_fee": "$75",
        "requirements": {
            "gpa": "4.0 unweighted or equivalent; very strong math/CS coursework required.",
            "tests": "SAT 1530-1590, ACT 34-36. Math II subject test strongly recommended.",
            "essays": [
                "Common App personal statement (650 words)",
                "CMU supplement: Why CS at CMU? (300 words)",
                "What do you hope to do at CMU? (300 words)",
            ],
            "recommendations": "2 teacher recommendations (Math + CS/Science preferred) + counselor.",
            "extracurriculars": "Competitive programming, open-source contributions, hackathons, research, personal app/game development.",
            "interviews": "CMU does not typically offer undergraduate interviews.",
        },
        "tips": [
            "CMU SCS is hyper-competitive — demonstrate extraordinary CS ability.",
            "Share specific projects with measurable impact — deployed apps, research papers, USACO scores.",
            "Show passion for the theory AND practice of CS.",
        ],
        "common_mistakes": [
            "Generic 'I love coding' essays.",
            "Not applying to a specific school within CMU (SCS, CIT, etc.).",
            "Underestimating the importance of teacher recommendations from Math/CS teachers.",
        ],
        "checklist": [
            "Decide which CMU school to apply to (SCS, CIT, CFA, etc.)",
            "Complete Common App",
            "Write personal statement (650 words)",
            "Write 'Why CS at CMU' essay (300 words)",
            "Write 'What you hope to do' essay (300 words)",
            "Request Math teacher recommendation",
            "Request CS/Science teacher recommendation",
            "Request counselor recommendation",
            "Send SAT/ACT scores",
            "Send official transcript",
            "Pay $75 application fee",
        ],
    },
    "oxford-law": {
        "id": "oxford-law",
        "university": "University of Oxford",
        "short_name": "Oxford",
        "program": "Law (BA/LLB)",
        "category": "Law",
        "logo_color": "#002147",
        "acceptance_rate": "12%",
        "avg_gpa": "4.0 (A-Levels: AAA)",
        "avg_sat": "1550",
        "avg_act": "35",
        "application_deadline": "October 15, 2024 (UCAS)",
        "decision_date": "January 2025",
        "application_fee": "£22.50 (UCAS)",
        "requirements": {
            "gpa": "A*AA at A-level or equivalent (IB 39+ points). Outstanding performance in essay-based subjects.",
            "tests": "LNAT (Law National Aptitude Test) score of 27+ highly competitive. Written by Dec 20.",
            "essays": [
                "UCAS personal statement (4000 characters)",
                "No supplementary essays; personal statement must cover academics, legal interest, and extracurriculars.",
            ],
            "recommendations": "1 academic reference through UCAS.",
            "extracurriculars": "Mooting, debate, law work experience, legal aid volunteering, reading legal journals.",
            "interviews": "Shortlisted candidates interviewed at Oxford in December (2 interviews typical).",
        },
        "tips": [
            "LNAT is the single biggest factor after grades — practice extensively.",
            "Personal statement must show genuine academic interest in law, not just career goals.",
            "Oxford interviews are Socratic — prepare to argue and defend positions.",
            "Reading legal texts and case law beyond the syllabus impresses interviewers.",
        ],
        "common_mistakes": [
            "Poor LNAT preparation — it requires months of practice.",
            "Personal statement focused on mooting/debates rather than academic law interest.",
            "Appearing to be motivated purely by career rather than intellectual interest.",
        ],
        "checklist": [
            "Register for LNAT (take before Oct 15)",
            "Complete UCAS application",
            "Write UCAS personal statement (4000 chars)",
            "Secure academic reference",
            "Send official predicted/actual A-level grades",
            "Apply through Oxford admissions portal",
            "Pay UCAS fee",
            "Prepare for December interviews",
        ],
    },
    "columbia-econ": {
        "id": "columbia-econ",
        "university": "Columbia University",
        "short_name": "Columbia",
        "program": "Economics (B.A.)",
        "category": "Social Sciences",
        "logo_color": "#75AADB",
        "acceptance_rate": "3.9%",
        "avg_gpa": "4.1",
        "avg_sat": "1550",
        "avg_act": "35",
        "application_deadline": "January 1, 2025",
        "decision_date": "March 28, 2025",
        "application_fee": "$85",
        "requirements": {
            "gpa": "3.9–4.2 weighted; strong AP Economics, Statistics, and Calculus performance.",
            "tests": "SAT 1500-1580, ACT 34-36.",
            "essays": [
                "Common App personal statement (650 words)",
                "Columbia supplement: Why Columbia? (200 words)",
                "Columbia supplement: A list of books, music, or films (150 words)",
                "Columbia supplement: Short take questions (3-4 questions, 35 words each)",
            ],
            "recommendations": "2 teacher recommendations + counselor recommendation.",
            "extracurriculars": "Research, economics competitions, Model UN, policy writing, internships.",
        },
        "tips": [
            "Columbia's Core Curriculum is central — show genuine interest in broad liberal arts.",
            "The 'Why Columbia' essay must reference specific faculty, courses, and programs.",
            "The short-takes reveal personality — be creative and authentic.",
        ],
        "common_mistakes": [
            "Generic Why Columbia essay.",
            "Not showing how you'll contribute to Columbia's diverse community.",
        ],
        "checklist": [
            "Complete Common App",
            "Write personal statement (650 words)",
            "Write Why Columbia essay (200 words)",
            "Write book/music/film list essay (150 words)",
            "Answer short-take questions",
            "Request 2 teacher recommendations",
            "Request counselor recommendation",
            "Send official scores",
            "Submit transcript",
            "Pay $85 application fee",
        ],
    },
    "caltech-physics": {
        "id": "caltech-physics",
        "university": "California Institute of Technology",
        "short_name": "Caltech",
        "program": "Physics (B.S.)",
        "category": "Science",
        "logo_color": "#FF6C0C",
        "acceptance_rate": "2.9%",
        "avg_gpa": "4.19",
        "avg_sat": "1580",
        "avg_act": "36",
        "application_deadline": "January 3, 2025",
        "decision_date": "March 15, 2025",
        "application_fee": "$75",
        "requirements": {
            "gpa": "Perfect or near-perfect GPA; exceptional performance in Physics and Math.",
            "tests": "SAT 1560-1600 (Math 800 expected), ACT 36.",
            "essays": [
                "Caltech personal essay (500 words): Who you are",
                "Short answers: What excites you about science? (200 words)",
                "Short answers: A problem you solved creatively (200 words)",
                "Short answers: What brings you joy outside of STEM? (200 words)",
            ],
            "recommendations": "2 teacher recommendations (Physics + Math required).",
            "extracurriculars": "Physics Olympiad (IPhO/USAPhO), research publications, science fairs (ISEF).",
        },
        "tips": [
            "Caltech wants pure scientific curiosity — show you do physics for the love of it.",
            "Research experience or Olympiad medals are near-mandatory for Physics.",
            "Show you've proven your curiosity through independent projects and reading.",
        ],
        "common_mistakes": [
            "No research or competition experience for a Physics applicant.",
            "Essays that don't show deep intellectual curiosity.",
        ],
        "checklist": [
            "Complete Caltech application (not Common App)",
            "Write personal essay (500 words)",
            "Write science excitement short answer (200 words)",
            "Write creative problem-solving short answer (200 words)",
            "Write joy outside STEM short answer (200 words)",
            "Request Physics teacher recommendation",
            "Request Math teacher recommendation",
            "Submit SAT/ACT scores (Math 800 expected)",
            "Submit research documentation if available",
            "Pay $75 application fee",
        ],
    },
}

CATEGORIES = ["All", "Technology", "Medicine", "Business", "Law", "Science", "Social Sciences"]

def get_all_programs():
    """Return list of all programs with summary fields."""
    return [
        {
            "id": p["id"],
            "university": p["university"],
            "short_name": p["short_name"],
            "program": p["program"],
            "category": p["category"],
            "logo_color": p["logo_color"],
            "acceptance_rate": p["acceptance_rate"],
            "avg_gpa": p["avg_gpa"],
            "avg_sat": p["avg_sat"],
            "avg_act": p["avg_act"],
            "deadline": p["application_deadline"],
        }
        for p in PROGRAMS.values()
    ]

def get_program(program_id):
    return PROGRAMS.get(program_id)

def get_program_context_text(program_id):
    """Return full program description as text for AI context / compression."""
    p = PROGRAMS.get(program_id)
    if not p:
        return ""
    reqs = p["requirements"]
    essays = "\n    - ".join(reqs.get("essays", []))
    tips = "\n    - ".join(p.get("tips", []))
    mistakes = "\n    - ".join(p.get("common_mistakes", []))
    text = f"""
UNIVERSITY: {p['university']}
PROGRAM: {p['program']}
ACCEPTANCE RATE: {p['acceptance_rate']}

REQUIREMENTS:
- GPA: {reqs.get('gpa', 'N/A')}
- Standardized Tests: {reqs.get('tests', 'N/A')}
- Essays:
    - {essays}
- Recommendations: {reqs.get('recommendations', 'N/A')}
- Extracurriculars: {reqs.get('extracurriculars', 'N/A')}
- Interviews: {reqs.get('interviews', 'No interviews offered')}

APPLICATION TIPS:
    - {tips}

COMMON MISTAKES TO AVOID:
    - {mistakes}

DEADLINE: {p['application_deadline']}
DECISION DATE: {p['decision_date']}
APPLICATION FEE: {p['application_fee']}
""".strip()
    return text
