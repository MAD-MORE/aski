"""UCC-specific intent routing used to improve retrieval and follow-ups."""

UCC_INTENTS = {
    "admissions": ["admission", "apply", "application", "requirements", "applicant", "wASSCE", "wassce", "mature", "cut off", "cut-off"],
    "registration": ["register", "registration", "course registration", "late registration", "add and drop", "adding and dropping", "dreos"],
    "fees": ["fees", "fee", "payment", "school fees", "charges", "cost", "tuition"],
    "academic_calendar": ["calendar", "semester", "academic year", "dates", "lecture", "examination", "exam", "results", "resit", "supplementary"],
    "programmes": ["programme", "program", "course", "department", "degree", "diploma", "certificate", "bachelor", "master", "mphil", "phd", "doctorate"],
    "colleges_and_schools": ["college", "faculty", "school", "unit", "department", "dean", "hod", "head of department"],
    "accommodation": ["hall", "halls", "accommodation", "residence", "hostel", "room", "bed space", "hall week"],
    "student_life": ["src", "jcr", "student life", "club", "society", "sports", "recreation", "event", "week", "orientation", "matriculation"],
    "library": ["library", "sam jonah", "journal", "e-resource", "research database", "borrowing", "book"],
    "academic_support": ["academic advisor", "academic counselling", "counselling", "study", "learning support", "academic support"],
    "graduate_studies": ["graduate", "postgraduate", "masters", "master's", "mphil", "phd", "thesis", "dissertation", "supervisor", "sgs"],
    "distance_education": ["distance", "code", "college of distance education", "coDE"],
    "international": ["international", "exchange", "foreign", "visa", "study abroad", "international relations"],
    "health_and_welfare": ["health", "clinic", "medical", "welfare", "disability", "counselling", "mental health"],
    "notices": ["notice", "announcement", "circular", "news", "update", "latest"],
    "contacts_and_directory": ["contact", "phone", "email", "address", "office", "staff", "director", "registrar"],
}


def classify_question(question):
    q = question.lower()
    scores = {intent: sum(term in q for term in terms) for intent, terms in UCC_INTENTS.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] else "general"
