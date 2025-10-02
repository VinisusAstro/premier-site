import { useState } from 'react'
import { Participant, Expense } from '../types'

interface Props {
  participants: Participant[]
  expenses: Expense[]
  onAddExpense: (expense: Omit<Expense, 'id' | 'date'>) => void
}

function ExpenseManager({ participants, expenses, onAddExpense }: Props) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!description.trim() || !amount || !paidBy || selectedParticipants.size === 0) {
      alert('Veuillez remplir tous les champs et sélectionner au moins un participant')
      return
    }

    onAddExpense({
      description: description.trim(),
      amount: parseFloat(amount),
      paidBy,
      participants: Array.from(selectedParticipants),
    })

    // Réinitialiser le formulaire
    setDescription('')
    setAmount('')
    setPaidBy('')
    setSelectedParticipants(new Set())
  }

  const toggleParticipant = (id: string) => {
    const newSet = new Set(selectedParticipants)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedParticipants(newSet)
  }

  const selectAll = () => {
    setSelectedParticipants(new Set(participants.map(p => p.id)))
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getParticipantName = (id: string) => {
    return participants.find(p => p.id === id)?.name || 'Inconnu'
  }

  return (
    <div className="section">
      <h2>💸 Dépenses</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Description de la dépense</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Restaurant, courses, essence..."
          />
        </div>

        <div className="form-group">
          <label>Montant (€)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label>Payé par</label>
          <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            <option value="">Sélectionner...</option>
            {participants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Participants concernés</label>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={selectAll}
            style={{ marginBottom: '10px' }}
          >
            Tout sélectionner
          </button>
          <div className="checkbox-group">
            {participants.map((participant) => (
              <label
                key={participant.id}
                className={`checkbox-label ${selectedParticipants.has(participant.id) ? 'checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedParticipants.has(participant.id)}
                  onChange={() => toggleParticipant(participant.id)}
                />
                {participant.name}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="btn">
          Ajouter la dépense
        </button>
      </form>

      {expenses.length > 0 && (
        <div className="expense-list">
          <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#333' }}>
            Historique des dépenses
          </h3>
          {expenses.map((expense) => (
            <div key={expense.id} className="expense-item">
              <div className="expense-info">
                <h3>{expense.description}</h3>
                <p>
                  Payé par {getParticipantName(expense.paidBy)} • {formatDate(expense.date)}
                </p>
                <p>
                  Pour: {expense.participants.map(id => getParticipantName(id)).join(', ')}
                </p>
              </div>
              <div className="expense-amount">
                {expense.amount.toFixed(2)}€
              </div>
            </div>
          ))}
        </div>
      )}

      {expenses.length === 0 && (
        <div className="empty-state">
          Aucune dépense enregistrée pour le moment
        </div>
      )}
    </div>
  )
}

export default ExpenseManager
