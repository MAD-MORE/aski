from collections import defaultdict

_conversations = defaultdict(list)


def add_message(session_id, role, content):
    _conversations[session_id].append({"role": role, "content": content})
    _conversations[session_id] = _conversations[session_id][-12:]


def get_history(session_id):
    return list(_conversations[session_id])
