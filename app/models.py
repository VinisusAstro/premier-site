from dataclasses import dataclass, field
from typing import List, Dict, Optional


@dataclass
class Member:
    name: str


@dataclass
class Expense:
    description: str
    payer: str
    amount: float
    participants: List[str]


@dataclass
class Group:
    name: str
    members: List[Member] = field(default_factory=list)
    expenses: List[Expense] = field(default_factory=list)

    def member_names(self) -> List[str]:
        return [m.name for m in self.members]

    def add_member(self, name: str) -> None:
        if name in self.member_names():
            return
        self.members.append(Member(name=name))

    def add_expense(self, description: str, payer: str, amount: float, participants: Optional[List[str]] = None) -> None:
        if participants is None:
            participants = self.member_names()
        if payer not in self.member_names():
            raise ValueError(f"Payer inconnu: {payer}")
        for p in participants:
            if p not in self.member_names():
                raise ValueError(f"Participant inconnu: {p}")
        self.expenses.append(Expense(description=description, payer=payer, amount=float(amount), participants=participants))

    def balances(self) -> Dict[str, float]:
        balances: Dict[str, float] = {name: 0.0 for name in self.member_names()}
        for exp in self.expenses:
            split = exp.amount / len(exp.participants)
            # Le payeur a avancé la totalité
            balances[exp.payer] += exp.amount
            # Chaque participant doit sa part
            for participant in exp.participants:
                balances[participant] -= split
        # Arrondi doux
        return {k: round(v, 2) for k, v in balances.items()}

    def settlements(self) -> List[Dict[str, object]]:
        # Algorithme glouton: faire correspondre créditeurs et débiteurs
        bal = self.balances()
        creditors = [(name, amt) for name, amt in bal.items() if amt > 0]
        debtors = [(name, -amt) for name, amt in bal.items() if amt < 0]
        creditors.sort(key=lambda x: x[1], reverse=True)
        debtors.sort(key=lambda x: x[1], reverse=True)
        i, j = 0, 0
        transfers: List[Dict[str, object]] = []
        while i < len(creditors) and j < len(debtors):
            c_name, c_amt = creditors[i]
            d_name, d_amt = debtors[j]
            pay = round(min(c_amt, d_amt), 2)
            if pay > 0:
                transfers.append({"from": d_name, "to": c_name, "amount": pay})
            c_amt = round(c_amt - pay, 2)
            d_amt = round(d_amt - pay, 2)
            if c_amt == 0:
                i += 1
            else:
                creditors[i] = (c_name, c_amt)
            if d_amt == 0:
                j += 1
            else:
                debtors[j] = (d_name, d_amt)
        return transfers
