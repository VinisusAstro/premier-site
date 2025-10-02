import { Participant, Expense, Balance, Settlement } from '../types'

export function calculateBalances(
  participants: Participant[],
  expenses: Expense[]
): Balance[] {
  const balances: { [key: string]: number } = {}

  // Initialiser les soldes à 0
  participants.forEach(participant => {
    balances[participant.id] = 0
  })

  // Calculer les soldes
  expenses.forEach(expense => {
    const sharePerPerson = expense.amount / expense.participants.length

    // La personne qui a payé reçoit le montant total
    balances[expense.paidBy] += expense.amount

    // Chaque participant (y compris celui qui a payé) doit sa part
    expense.participants.forEach(participantId => {
      balances[participantId] -= sharePerPerson
    })
  })

  // Convertir en tableau de Balance
  return participants.map(participant => ({
    participant: participant.name,
    amount: balances[participant.id],
  }))
}

export function calculateSettlements(balances: Balance[]): Settlement[] {
  // Créer une copie des soldes pour manipulation
  const debtors = balances
    .filter(b => b.amount < -0.01) // Ceux qui doivent de l'argent
    .map(b => ({ ...b }))
    .sort((a, b) => a.amount - b.amount) // Du plus négatif au moins négatif

  const creditors = balances
    .filter(b => b.amount > 0.01) // Ceux à qui on doit de l'argent
    .map(b => ({ ...b }))
    .sort((a, b) => b.amount - a.amount) // Du plus positif au moins positif

  const settlements: Settlement[] = []
  let debtorIndex = 0
  let creditorIndex = 0

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex]
    const creditor = creditors[creditorIndex]

    const debtAmount = Math.abs(debtor.amount)
    const creditAmount = creditor.amount

    const settleAmount = Math.min(debtAmount, creditAmount)

    if (settleAmount > 0.01) {
      settlements.push({
        from: debtor.participant,
        to: creditor.participant,
        amount: settleAmount,
      })
    }

    debtor.amount += settleAmount
    creditor.amount -= settleAmount

    if (Math.abs(debtor.amount) < 0.01) {
      debtorIndex++
    }

    if (creditor.amount < 0.01) {
      creditorIndex++
    }
  }

  return settlements
}
