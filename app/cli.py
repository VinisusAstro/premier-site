import json
from typing import List, Optional
import argparse

from .models import Group
from .storage import save_group, load_group


def cmd_init_group(args: argparse.Namespace) -> None:
    group = Group(name=args.name)
    for member in args.members:
        group.add_member(member)
    save_group(group)
    print(f"Groupe '{group.name}' initialisé avec {len(group.members)} membres.")


def cmd_add_member(args: argparse.Namespace) -> None:
    group = load_group(args.group)
    for member in args.members:
        group.add_member(member)
    save_group(group)
    print(f"{len(args.members)} membre(s) ajouté(s) au groupe '{group.name}'.")


def cmd_add_expense(args: argparse.Namespace) -> None:
    group = load_group(args.group)
    participants: Optional[List[str]] = args.participants if args.participants else None
    group.add_expense(
        description=args.description,
        payer=args.payer,
        amount=float(args.amount),
        participants=participants,
    )
    save_group(group)
    print("Dépense ajoutée.")


def cmd_balances(args: argparse.Namespace) -> None:
    group = load_group(args.group)
    balances = group.balances()
    for name, amount in sorted(balances.items()):
        print(f"{name}: {amount:.2f}")


def cmd_settlements(args: argparse.Namespace) -> None:
    group = load_group(args.group)
    transfers = group.settlements()
    if not transfers:
        print("Aucun règlement nécessaire.")
        return
    for t in transfers:
        print(f"{t['from']} -> {t['to']}: {t['amount']:.2f}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="splitpotes", description="Suivi de dépenses entre amis")
    sub = parser.add_subparsers(dest="command", required=True)

    p_init = sub.add_parser("init-group", help="Créer un groupe")
    p_init.add_argument("name", help="Nom du groupe")
    p_init.add_argument("members", nargs="+", help="Noms des membres")
    p_init.set_defaults(func=cmd_init_group)

    p_addm = sub.add_parser("add-member", help="Ajouter des membres")
    p_addm.add_argument("group", help="Nom du groupe")
    p_addm.add_argument("members", nargs="+", help="Noms des membres")
    p_addm.set_defaults(func=cmd_add_member)

    p_exp = sub.add_parser("add-expense", help="Ajouter une dépense")
    p_exp.add_argument("group", help="Nom du groupe")
    p_exp.add_argument("description", help="Description")
    p_exp.add_argument("payer", help="Payeur")
    p_exp.add_argument("amount", type=float, help="Montant")
    p_exp.add_argument("--participants", nargs="*", help="Participants (défaut: tous)")
    p_exp.set_defaults(func=cmd_add_expense)

    p_bal = sub.add_parser("balances", help="Afficher les soldes")
    p_bal.add_argument("group", help="Nom du groupe")
    p_bal.set_defaults(func=cmd_balances)

    p_set = sub.add_parser("settlements", help="Suggérer des règlements")
    p_set.add_argument("group", help="Nom du groupe")
    p_set.set_defaults(func=cmd_settlements)

    return parser


def main(argv: Optional[List[str]] = None) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
