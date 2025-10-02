import { Participant, Balance, Settlement } from '../types'

interface Props {
  participants: Participant[]
  balances: Balance[]
  settlements: Settlement[]
}

function BalanceDisplay({ balances, settlements }: Props) {
  const getBalanceClass = (amount: number) => {
    if (amount > 0.01) return 'positive'
    if (amount < -0.01) return 'negative'
    return 'zero'
  }

  const getBalanceText = (amount: number) => {
    if (amount > 0.01) return `+${amount.toFixed(2)}€`
    if (amount < -0.01) return `${amount.toFixed(2)}€`
    return '0.00€'
  }

  const hasSettlements = settlements.length > 0

  return (
    <div className="section">
      <h2>📊 Soldes et Règlements</h2>

      <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#333' }}>
        Soldes par personne
      </h3>
      <div className="balances-grid">
        {balances.map((balance, index) => (
          <div key={index} className="balance-card">
            <h3>{balance.participant}</h3>
            <div className={`balance-amount ${getBalanceClass(balance.amount)}`}>
              {getBalanceText(balance.amount)}
            </div>
            {balance.amount > 0.01 && (
              <p style={{ color: '#28a745', marginTop: '10px', fontSize: '0.9rem' }}>
                Doit recevoir
              </p>
            )}
            {balance.amount < -0.01 && (
              <p style={{ color: '#dc3545', marginTop: '10px', fontSize: '0.9rem' }}>
                Doit payer
              </p>
            )}
            {Math.abs(balance.amount) <= 0.01 && (
              <p style={{ color: '#6c757d', marginTop: '10px', fontSize: '0.9rem' }}>
                À jour
              </p>
            )}
          </div>
        ))}
      </div>

      {hasSettlements && (
        <>
          <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#333' }}>
            💳 Comment rembourser ?
          </h3>
          <div className="settlements-list">
            {settlements.map((settlement, index) => (
              <div key={index} className="settlement-item">
                <div className="settlement-text">
                  <strong>{settlement.from}</strong>
                  <span className="arrow">→</span>
                  <strong>{settlement.to}</strong>
                </div>
                <div className="settlement-amount">
                  {settlement.amount.toFixed(2)}€
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!hasSettlements && balances.length > 0 && (
        <div className="empty-state">
          ✅ Tous les comptes sont équilibrés !
        </div>
      )}
    </div>
  )
}

export default BalanceDisplay
