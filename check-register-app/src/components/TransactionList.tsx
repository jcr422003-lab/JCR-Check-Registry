import type { Transaction } from '../types'

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <section className="transaction-list">
      <h2>Recent Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Payee</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td>{txn.date}</td>
                <td>{txn.payee}</td>
                <td>{txn.category}</td>
                <td className={txn.amount >= 0 ? 'positive' : 'negative'}>
                  {txn.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
