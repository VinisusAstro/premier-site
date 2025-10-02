import { useState } from 'react'
import { Participant, Expense, Balance, Settlement } from './types'
import ParticipantManager from './components/ParticipantManager'
import ExpenseManager from './components/ExpenseManager'
import BalanceDisplay from './components/BalanceDisplay'
import { calculateBalances, calculateSettlements } from './utils/calculations'

function App() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])

  const addParticipant = (name: string) => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name,
    }
    setParticipants([...participants, newParticipant])
  }

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id))
    // Supprimer les dépenses liées à ce participant
    setExpenses(expenses.filter(e => e.paidBy !== id))
  }

  const addExpense = (expense: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      date: new Date(),
    }
    setExpenses([...expenses, newExpense])
  }

  const balances = calculateBalances(participants, expenses)
  const settlements = calculateSettlements(balances)

  return (
    <div className="app">
      <div className="header">
        <h1>💰 Split Expenses</h1>
        <p>Gérez facilement vos dépenses partagées entre amis</p>
      </div>

      <ParticipantManager
        participants={participants}
        onAddParticipant={addParticipant}
        onRemoveParticipant={removeParticipant}
      />

      {participants.length > 0 && (
        <>
          <ExpenseManager
            participants={participants}
            expenses={expenses}
            onAddExpense={addExpense}
          />

          <BalanceDisplay
            participants={participants}
            balances={balances}
            settlements={settlements}
          />
        </>
      )}
    </div>
  )
}

export default App
