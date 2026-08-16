UCC_INTENTS = {
    "admissions": ["admission", "apply", "application", "requirements"],
    "registration": ["register", "registration", "course registration", "late registration"],
    "fees": ["fees", "fee", "payment", "school fees"],
    "academic_calendar": ["calendar", "semester", "academic year", "dates"],
    "programmes": ["programme", "program", "course", "department"],
    "halls": ["hall", "accommodation", "residence", "hostel"],
    "notices": ["notice", "announcement", "circular"],
}


def classify_question(question):
    q = question.lower()
    scores = {intent: sum(term in q for term in terms) for intent, terms in UCC_INTENTS.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] else "general"
