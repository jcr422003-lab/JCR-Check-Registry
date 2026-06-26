export type AccountType = 'checking' | 'savings' | 'credit_card' | 'cash'

export interface Account {
  id: string
  name: string
  type: AccountType
  createdAt: string
}

export interface Transaction {
  id: string
  accountId: string
  date: string
  payee: string
  category: string
  memo?: string
  amount: number
  isCleared: boolean
  transferTransactionId?: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  createdAt: string
}

export interface AppState {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
}
