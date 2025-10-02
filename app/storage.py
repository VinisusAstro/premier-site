import json
from pathlib import Path
from typing import Dict, Any
from .models import Group, Member, Expense

DATA_DIR = Path("/workspace/data/groups")
DATA_DIR.mkdir(parents=True, exist_ok=True)


def _group_file(name: str) -> Path:
    return DATA_DIR / f"{name}.json"


def save_group(group: Group) -> None:
    data: Dict[str, Any] = {
        "name": group.name,
        "members": [m.name for m in group.members],
        "expenses": [
            {
                "description": e.description,
                "payer": e.payer,
                "amount": e.amount,
                "participants": e.participants,
            }
            for e in group.expenses
        ],
    }
    with _group_file(group.name).open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_group(name: str) -> Group:
    path = _group_file(name)
    if not path.exists():
        raise FileNotFoundError(f"Groupe introuvable: {name}")
    with path.open("r", encoding="utf-8") as f:
        raw = json.load(f)
    group = Group(name=raw["name"])
    for m in raw.get("members", []):
        group.members.append(Member(name=m))
    for e in raw.get("expenses", []):
        group.expenses.append(
            Expense(
                description=e["description"],
                payer=e["payer"],
                amount=float(e["amount"]),
                participants=list(e["participants"]),
            )
        )
    return group
