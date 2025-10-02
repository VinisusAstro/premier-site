import { useState } from 'react'
import { Participant } from '../types'

interface Props {
  participants: Participant[]
  onAddParticipant: (name: string) => void
  onRemoveParticipant: (id: string) => void
}

function ParticipantManager({ participants, onAddParticipant, onRemoveParticipant }: Props) {
  const [newParticipant, setNewParticipant] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newParticipant.trim()) {
      onAddParticipant(newParticipant.trim())
      setNewParticipant('')
    }
  }

  return (
    <div className="section">
      <h2>👥 Participants</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Ajouter un participant</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              placeholder="Nom du participant..."
            />
            <button type="submit" className="btn">
              Ajouter
            </button>
          </div>
        </div>
      </form>

      {participants.length > 0 && (
        <div className="participant-list">
          {participants.map((participant) => (
            <div key={participant.id} className="participant-chip">
              <span>{participant.name}</span>
              <button onClick={() => onRemoveParticipant(participant.id)}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {participants.length === 0 && (
        <div className="empty-state">
          Ajoutez des participants pour commencer
        </div>
      )}
    </div>
  )
}

export default ParticipantManager
