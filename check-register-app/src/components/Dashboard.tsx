import type { Account, Transaction } from '../types'

interface DashboardProps {
  accounts: Account[]
  transactions: Transaction[]
  onSelectAccount: (accountId: string) => void
}

function calculateAccountBalance(accountId: string, transactions: Transaction[]) {
  return transactions
    .filter((txn) => txn.accountId === accountId)
    .reduce((sum, txn) => sum + txn.amount, 0)
}

export function Dashboard({ accounts, transactions, onSelectAccount }: DashboardProps) {
  return (
    <section className="dashboard">
      <h2>Accounts</h2>
      <div className="account-grid">
        {accounts.map((account) => (
          <button
            key={account.id}
            className="account-card"
            type="button"
            onClick={() => onSelectAccount(account.id)}
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
