import { useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Account, AppState, Category, Transaction } from './types'
import { loadState, saveState } from './services/storage'
import { Dashboard } from './components/Dashboard'
import { TransactionList } from './components/TransactionList'
import './App.css'

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Groceries', createdAt: new Date().toISOString() },
  { id: 'cat-2', name: 'Utilities', createdAt: new Date().toISOString() },
  { id: 'cat-3', name: 'Rent', createdAt: new Date().toISOString() }
]

function App() {
  const [state, setState] = useState<AppState>({ accounts: [], categories: [], transactions: [] })
  const [loading, setLoading] = useState(true)
  const [accountName, setAccountName] = useState('')
  const [transactionAccountId, setTransactionAccountId] = useState('')
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10))
  const [transactionPayee, setTransactionPayee] = useState('')
  const [transactionCategory, setTransactionCategory] = useState('')
  const [transactionAmount, setTransactionAmount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [accountFilter, setAccountFilter] = useState('all')
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const savedState = await loadState()
      setState({
        accounts: savedState.accounts,
        categories: savedState.categories.length > 0 ? savedState.categories : defaultCategories,
        transactions: savedState.transactions
      })
      setLoading(false)
    }

    load()
  }, [])

  useEffect(() => {
    if (!loading) {
      saveState(state)
    }
  }, [state, loading])

  const handleAddAccount = () => {
    if (!accountName.trim()) return

    const account: Account = {
      id: uuidv4(),
      name: accountName.trim(),
      type: 'checking',
      createdAt: new Date().toISOString()
    }

    setState((current) => ({
      ...current,
      accounts: [...current.accounts, account]
    }))
    setAccountName('')
  }

  const resetTransactionForm = () => {
    setTransactionAccountId('')
    setTransactionDate(new Date().toISOString().slice(0, 10))
    setTransactionPayee('')
    setTransactionCategory('')
    setTransactionAmount(0)
    setEditingTransactionId(null)
  }

  const handleAddTransaction = () => {
    if (!transactionAccountId || !transactionPayee.trim() || !transactionCategory) return

    const normalizedAmount = Number(transactionAmount)
    if (Number.isNaN(normalizedAmount)) return

    const transactionData = {
      accountId: transactionAccountId,
      date: transactionDate,
      payee: transactionPayee.trim(),
      category: transactionCategory,
      amount: normalizedAmount,
      isCleared: false,
      createdAt: new Date().toISOString()
    }

    if (editingTransactionId) {
      setState((current) => ({
        ...current,
        transactions: current.transactions.map((transaction) =>
          transaction.id === editingTransactionId
            ? { ...transaction, ...transactionData }
            : transaction
        )
      }))
    } else {
      const transaction: Transaction = {
        id: uuidv4(),
        ...transactionData
      }

      setState((current) => ({
        ...current,
        transactions: [...current.transactions, transaction]
      }))
    }

    resetTransactionForm()
  }

  const handleDeleteTransaction = (transactionId: string) => {
    if (editingTransactionId === transactionId) {
      resetTransactionForm()
    }

    setState((current) => ({
      ...current,
      transactions: current.transactions.filter((transaction) => transaction.id !== transactionId)
    }))
  }

  const handleStartEditTransaction = (transaction: Transaction) => {
    setEditingTransactionId(transaction.id)
    setTransactionAccountId(transaction.accountId)
    setTransactionDate(transaction.date)
    setTransactionPayee(transaction.payee)
    setTransactionCategory(transaction.category)
    setTransactionAmount(transaction.amount)
  }

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return state.transactions.filter((transaction) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        transaction.payee.toLowerCase().includes(normalizedSearch) ||
        transaction.category.toLowerCase().includes(normalizedSearch)
      const matchesAccount = accountFilter === 'all' || transaction.accountId === accountFilter

      return matchesSearch && matchesAccount
    })
  }, [accountFilter, searchTerm, state.transactions])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Check Register</h1>
        <p>Shared mobile + browser financial register</p>
      </header>

      <Dashboard
        accounts={state.accounts}
        transactions={state.transactions}
        onSelectAccount={() => {}}
      />

      <section className="form-section">
        <div className="form-card">
          <h2>Add Account</h2>
          <input
            type="text"
            placeholder="Account name"
            value={accountName}
            onChange={(event) => setAccountName(event.target.value)}
          />
          <button onClick={handleAddAccount}>Add account</button>
        </div>

        <div className="form-card">
          <h2>{editingTransactionId ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <select
            value={transactionAccountId}
            onChange={(event) => setTransactionAccountId(event.target.value)}
          >
            <option value="">Select account</option>
            {state.accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={transactionDate}
            onChange={(event) => setTransactionDate(event.target.value)}
          />
          <input
            type="text"
            placeholder="Payee"
            value={transactionPayee}
            onChange={(event) => setTransactionPayee(event.target.value)}
          />
          <select
            value={transactionCategory}
            onChange={(event) => setTransactionCategory(event.target.value)}
          >
            <option value="">Select category</option>
            {state.categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={transactionAmount}
            onChange={(event) => setTransactionAmount(Number(event.target.value))}
            step="0.01"
          />
          <button onClick={handleAddTransaction}>
            {editingTransactionId ? 'Save changes' : 'Add transaction'}
          </button>
          {editingTransactionId ? (
            <button className="secondary-button" onClick={resetTransactionForm}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </section>

      <section className="transaction-list">
        <div className="transaction-toolbar">
          <div>
            <h2>Transactions</h2>
            <p>Search and filter your register history.</p>
          </div>
          <div className="filter-row">
            <input
              type="text"
              placeholder="Search payee or category"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <select value={accountFilter} onChange={(event) => setAccountFilter(event.target.value)}>
              <option value="all">All accounts</option>
              {state.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <TransactionList
          transactions={filteredTransactions}
          accounts={state.accounts}
          onEdit={handleStartEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      </section>
    </div>
  )
}

export default App
