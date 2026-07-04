import type { Account, Transaction } from '../types'

interface DashboardProps {
  accounts: Account[]
  transactions: Transaction[]
  onSelectAccount: (accountId: string) => void
  draggedAccountId: string | null
  onDragStart: (accountId: string) => void
  onDragOver: (accountId: string) => void
  onDrop: () => void
}

function calculateAccountBalance(accountId: string, transactions: Transaction[]) {
  return transactions
    .filter((txn) => txn.accountId === accountId)
    .reduce((sum, txn) => sum + txn.amount, 0)
}

export function Dashboard({
  accounts,
  transactions,
  onSelectAccount,
  draggedAccountId,
  onDragStart,
  onDragOver,
  onDrop
}: DashboardProps) {
  return (
    <section className="dashboard">
      <h2>Accounts</h2>
      <p className="card-help">Drag cards to reorder your account list.</p>
      <div className="account-grid">
        {accounts.map((account) => (
          <button
            key={account.id}
            className={`account-card${draggedAccountId === account.id ? ' dragged' : ''}`}
            type="button"
            onClick={() => onSelectAccount(account.id)}
            draggable
            onDragStart={() => onDragStart(account.id)}
            onDragOver={(event) => {
              event.preventDefault()
              onDragOver(account.id)
            }}
            onDrop={(event) => {
              event.preventDefault()
              onDrop()
            }}
          >
            <div className="account-name">{account.name}</div>
            <div className="account-balance">
              ${calculateAccountBalance(account.id, transactions).toFixed(2)}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
