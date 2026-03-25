"""
Indian college admissions data.
Each entry is a course or college with structured information.
"""

PROGRAMS = {
    "btech": {
        "id": "btech",
        "name": "B.Tech",
        "full": "Bachelor of Technology",
        "level": "UG",
        "duration": "4 Years",
        "category": "Engineering",
        "logo_color": "#4f46e5",
        "short_name": "B.Tech",
        "streams": ["PCM"],
        "min_percent": 75,
        "exams": ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "SRMJEE", "MH CET"],
        "salary": "Rs. 6-25 LPA",
        "top_colleges": ["IIT Bombay", "IIT Delhi", "IIT Madras", "NIT Trichy", "BITS Pilani", "VIT Vellore"],
        "careers": ["Software Engineer", "Data Scientist", "Core Engineer", "Product Manager"],
        "description": "India's most sought-after engineering degree. Covers CS, ECE, Mechanical, Civil, AI/ML and more. JEE Main is the primary gateway to NITs; JEE Advanced for IITs.",
        "cutoffs": {
            "IIT Bombay (CS)": "JEE Adv Rank: Top 100",
            "IIT Delhi (CS)": "JEE Adv Rank: Top 200",
            "NIT Trichy (CS)": "JEE Main 98.5%ile+",
            "BITS Pilani (CS)": "BITSAT 385+",
            "VIT Vellore (CS)": "VITEEE Rank: Top 10,000",
        },
        "fees": {
            "IITs": "Rs. 2.2L/yr",
            "NITs": "Rs. 1.49L/yr",
            "BITS Pilani": "Rs. 5.6L/yr",
            "VIT Vellore": "Rs. 2.2L/yr",
            "Private (avg)": "Rs. 1.5-4L/yr",
        },
    },
    "bca": {
        "id": "bca",
        "name": "BCA",
        "full": "Bachelor of Computer Applications",
        "level": "UG",
        "duration": "3 Years",
        "category": "Computer Science",
        "logo_color": "#0891b2",
        "short_name": "BCA",
        "streams": ["PCM", "Commerce+Maths", "Arts+Maths"],
        "min_percent": 50,
        "exams": ["CUET", "IPU CET", "Symbiosis SET", "college-specific"],
        "salary": "Rs. 3-10 LPA",
        "top_colleges": ["Symbiosis Pune", "Christ University", "NMIMS Mumbai", "DU colleges"],
        "careers": ["Software Developer", "Web Developer", "System Analyst", "Database Administrator"],
        "description": "Focused CS program. Open to Commerce and Arts students with Maths. Shorter and more affordable than B.Tech.",
    },
    "bba": {
        "id": "bba",
        "name": "BBA",
        "full": "Bachelor of Business Administration",
        "level": "UG",
        "duration": "3 Years",
        "category": "Management",
        "logo_color": "#d97706",
        "short_name": "BBA",
        "streams": ["PCM", "PCB", "Commerce", "Commerce+Maths", "Arts"],
        "min_percent": 50,
        "exams": ["CUET", "IPMAT", "DU JAT", "Symbiosis SET", "college-specific"],
        "salary": "Rs. 3-8 LPA",
        "top_colleges": ["IIM Indore (IPM)", "Symbiosis Pune", "NMIMS Mumbai", "Christ Bangalore"],
        "careers": ["Business Analyst", "Marketing Manager", "HR Executive", "Entrepreneur"],
        "description": "Foundation in business and management. Strong base for MBA.",
    },
    "mba": {
        "id": "mba",
        "name": "MBA",
        "full": "Master of Business Administration",
        "level": "PG",
        "duration": "2 Years",
        "category": "Management",
        "logo_color": "#dc2626",
        "short_name": "MBA",
        "streams": ["Any graduate"],
        "min_percent": 50,
        "exams": ["CAT", "XAT", "SNAP", "NMAT", "CMAT", "MAT", "IIFT"],
        "salary": "Rs. 8-50 LPA",
        "top_colleges": ["IIM Ahmedabad", "IIM Bangalore", "IIM Calcutta", "ISB Hyderabad", "XLRI Jamshedpur"],
        "careers": ["Management Consultant", "Investment Banker", "Product Manager", "Strategy Head"],
        "description": "Premier PG management degree. CAT 99+ percentile needed for top IIMs.",
    },
    "mbbs": {
        "id": "mbbs",
        "name": "MBBS",
        "full": "Bachelor of Medicine & Bachelor of Surgery",
        "level": "UG",
        "duration": "5.5 Years",
        "category": "Medicine",
        "logo_color": "#0f766e",
        "short_name": "MBBS",
        "streams": ["PCB"],
        "min_percent": 50,
        "exams": ["NEET-UG"],
        "salary": "Rs. 6-30 LPA",
        "top_colleges": ["AIIMS New Delhi", "JIPMER Puducherry", "CMC Vellore"],
        "careers": ["General Physician", "Surgeon", "Medical Researcher"],
        "description": "The only path to become a doctor in India. NEET-UG is mandatory.",
    },
    "llb": {
        "id": "llb",
        "name": "LLB (5-yr)",
        "full": "Bachelor of Laws — 5 Year Integrated",
        "level": "UG",
        "duration": "5 Years",
        "category": "Law",
        "logo_color": "#92400e",
        "short_name": "LLB",
        "streams": ["PCM", "PCB", "Commerce", "Arts"],
        "min_percent": 45,
        "exams": ["CLAT", "AILET", "LSAT India", "MH CET Law"],
        "salary": "Rs. 4-30 LPA",
        "top_colleges": ["NLSIU Bangalore", "NLU Delhi", "NALSAR Hyderabad"],
        "careers": ["Advocate", "Corporate Lawyer", "Legal Consultant"],
        "description": "5-year integrated BA LLB after 12th via CLAT for NLUs.",
    },
}

# ✅ Auto-generate categories dynamically
CATEGORIES = sorted(
    list({program["category"] for program in PROGRAMS.values()})
)


def get_all_programs():
    return [
        {
            "id": p["id"],
            "name": p["name"],
            "full": p["full"],
            "level": p["level"],
            "duration": p["duration"],
            "category": p["category"],
            "logo_color": p["logo_color"],
            "short_name": p["short_name"],
            "salary": p["salary"],
            "description": p["description"],
            "top_colleges": p["top_colleges"],
        }
        for p in PROGRAMS.values()
    ]


def get_program(program_id: str):
    return PROGRAMS.get(program_id)


def get_program_context_text(program_id: str):
    p = PROGRAMS.get(program_id)
    if not p:
        return None

    lines = [
        f"Program: {p['name']} ({p['full']})",
        f"Level: {p['level']} | Duration: {p['duration']} | Category: {p['category']}",
        f"Eligible streams: {', '.join(p['streams'])}",
        f"Minimum 12th %: {p['min_percent']}%",
        f"Entrance exams: {', '.join(p['exams'])}",
        f"Average salary: {p['salary']}",
        f"\nAbout: {p['description']}",
        f"\nTop colleges: {', '.join(p['top_colleges'])}",
    ]

    if p.get("careers"):
        lines.append(f"\nCareer paths: {', '.join(p['careers'])}")

    return "\n".join(lines)