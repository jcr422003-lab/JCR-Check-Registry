import type { AppState, Account, Category, Transaction } from '../types'

const STORAGE_KEY = 'check-register-state-v1'

const initialState: AppState = {
  accounts: [],
  categories: [],
  transactions: []
}

export async function loadState(): Promise<AppState> {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return initialState
  }

  try {
    const parsed = JSON.parse(raw) as AppState
    return parsed
  } catch (error) {
    console.error('Failed to parse local storage state', error)
    return initialState
  }
}

export async function saveState(state: AppState): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export async function clearState(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY)
}

export async function addAccount(account: Account): Promise<void> {
  const state = await loadState()
  state.accounts.push(account)
  await saveState(state)
}

export async function addCategory(category: Category): Promise<void> {
  const state = await loadState()
  state.categories.push(category)
  await saveState(state)
}

export async function addTransaction(transaction: Transaction): Promise<void> {
  const state = await loadState()
  state.transactions.push(transaction)
  await saveState(state)
}
