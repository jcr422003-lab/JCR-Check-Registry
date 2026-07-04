import { useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Account, AppState, Category, Transaction } from './types'
import { loadState, saveState } from './services/storage'
import { getCurrentUser, signInWithMagicLink, signOut, supabase } from './services/supabase'
import { Dashboard } from './components/Dashboard'
import { TransactionList } from './components/TransactionList'
import './App.css'

const THEME_STORAGE_KEY = 'check-register-theme'

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
  const [transactionAmount, setTransactionAmount] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return (window.localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null) ?? 'light'
  })
  const [accountFilter, setAccountFilter] = useState('all')
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [draggedAccountId, setDraggedAccountId] = useState<string | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [isHomeNetwork, setIsHomeNetwork] = useState(true)
  const [authMessage, setAuthMessage] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const savedState = await loadState()
      const currentUser = await getCurrentUser()
      setState({
        accounts: savedState.accounts,
        categories: savedState.categories.length > 0 ? savedState.categories : defaultCategories,
        transactions: savedState.transactions
      })
      setUserEmail(currentUser?.email ?? null)
      setLoading(false)
    }

    load()
  }, [])

  useEffect(() => {
    if (!loading) {
      saveState(state)
    }
  }, [state, loading])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const currentHost = window.location.hostname
    const homeHostnames = ['localhost', '127.0.0.1', '0.0.0.0', 'home.local', 'check-home']
    const isHome = currentHost === 'localhost' || currentHost === '127.0.0.1' || homeHostnames.includes(currentHost)
    setIsHomeNetwork(isHome)
  }, [])

  const handleAddAccount = () => {
    if (!isHomeNetwork) {
      setAuthMessage('Account creation is available only while connected to the home network.')
      return
    }

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
    setShowAccountMenu(false)
  }

  const resetTransactionForm = () => {
    setTransactionAccountId('')
    setTransactionDate(new Date().toISOString().slice(0, 10))
    setTransactionPayee('')
    setTransactionCategory('')
    setTransactionAmount('')
    setEditingTransactionId(null)
  }

  const handleAddTransaction = () => {
    if (!isHomeNetwork) {
      setAuthMessage('Transactions can only be added while connected to the home network.')
      return
    }

    if (!transactionAccountId || !transactionPayee.trim() || !transactionCategory) return

    const trimmedAmount = transactionAmount.trim()
    if (!trimmedAmount) return

    const normalizedAmount = Number(trimmedAmount)
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
    setTransactionAmount(String(transaction.amount))
  }

  const handleReorderAccounts = (fromId: string, toId: string) => {
    if (fromId === toId) return

    setState((current) => {
      const accounts = [...current.accounts]
      const fromIndex = accounts.findIndex((account) => account.id === fromId)
      const toIndex = accounts.findIndex((account) => account.id === toId)

      if (fromIndex < 0 || toIndex < 0) return current

      const [moved] = accounts.splice(fromIndex, 1)
      accounts.splice(toIndex, 0, moved)

      return { ...current, accounts }
    })
  }

  const handleAuthSubmit = async () => {
    if (!authEmail.trim()) return

    if (!supabase) {
      setAuthMessage('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable sign-in.')
      return
    }

    const { error } = await signInWithMagicLink(authEmail.trim())
    if (error) {
      setAuthMessage(error.message)
      return
    }

    setAuthMessage('Magic link sent. Check your email to continue.')
    setAuthEmail('')
  }

  const handleSignOut = async () => {
    if (!supabase) {
      setAuthMessage('Supabase is not configured yet.')
      return
    }

    const { error } = await signOut()
    if (error) {
      setAuthMessage(error.message)
      return
    }

    setUserEmail(null)
    setAuthMessage('Signed out.')
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
        <div className="header-row">
          <div>
            <h1>Check Register</h1>
            <p>Shared mobile + browser financial register</p>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setShowAccountMenu((current) => !current)}
            >
              ☰ Menu
            </button>
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
              aria-label="Toggle color theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      {showAccountMenu ? (
        <div className="menu-popover">
          <div className="menu-card">
            <h2>Add account</h2>
            <p className="card-help">Create a new account and it will appear in your ordered account list.</p>
            <input
              type="text"
              placeholder="Account name"
              value={accountName}
              onChange={(event) => setAccountName(event.target.value)}
            />
            <div className="menu-actions">
              <button onClick={handleAddAccount}>Save account</button>
              <button className="secondary-button" onClick={() => setShowAccountMenu(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="status-card">
        <div>
          <h2>Home mode</h2>
          <p className="card-help">
            {isHomeNetwork
              ? 'You are on the trusted home network, so writes are enabled.'
              : 'You are outside the home network. Writes are disabled until you reconnect.'}
          </p>
        </div>
      </section>

      <section className="auth-card">
        <div>
          <h2>Sign in</h2>
          <p className="card-help">
            {userEmail ? `Signed in as ${userEmail}` : 'Use email sign-in when Supabase is configured.'}
          </p>
        </div>
        {!userEmail ? (
          <div className="auth-controls">
            <input
              type="email"
              placeholder="you@example.com"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
            />
            <button type="button" onClick={handleAuthSubmit}>
              Send magic link
            </button>
          </div>
        ) : (
          <button type="button" className="secondary-button" onClick={handleSignOut}>
            Sign out
          </button>
        )}
        {authMessage ? <p className="auth-message">{authMessage}</p> : null}
      </section>

      <Dashboard
        accounts={state.accounts}
        transactions={state.transactions}
        onSelectAccount={() => {}}
        draggedAccountId={draggedAccountId}
        onDragStart={(accountId) => setDraggedAccountId(accountId)}
        onDragOver={(accountId) => {
          if (draggedAccountId && draggedAccountId !== accountId) {
            handleReorderAccounts(draggedAccountId, accountId)
            setDraggedAccountId(accountId)
          }
        }}
        onDrop={() => setDraggedAccountId(null)}
      />

      <section className="form-section">
        <div className="form-card primary-card">
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
            type="text"
            inputMode="decimal"
            placeholder="Amount"
            value={transactionAmount}
            onChange={(event) => setTransactionAmount(event.target.value)}
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
