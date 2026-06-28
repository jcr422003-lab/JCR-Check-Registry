import type { Account, Transaction } from '../types'

interface TransactionListProps {
  transactions: Transaction[]
  accounts: Account[]
  onEdit: (transaction: Transaction) => void
  onDelete: (transactionId: string) => void
}

export function TransactionList({ transactions, accounts, onEdit, onDelete }: TransactionListProps) {
  const getAccountName = (accountId: string) =>
    accounts.find((account) => account.id === accountId)?.name ?? 'Unknown account'

  return (
    <>
      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Account</th>
              <th>Payee</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td>{txn.date}</td>
                <td>{getAccountName(txn.accountId)}</td>
                <td>{txn.payee}</td>
                <td>{txn.category}</td>
                <td className={txn.amount >= 0 ? 'positive' : 'negative'}>
                  {txn.amount.toFixed(2)}
                </td>
                <td>
                  <div className="action-buttons">
                    <button type="button" onClick={() => onEdit(txn)}>
                      Edit
                    </button>
                    <button type="button" className="danger-button" onClick={() => onDelete(txn.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
