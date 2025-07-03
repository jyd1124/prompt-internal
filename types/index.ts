export interface Prompt {
  id: number
  title: string
  content: string
  tags: string[]
  scenario?: string
  role?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface FilterOptions {
  scenario: string
  role: string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
}

export type ScenarioType = 'writing' | 'coding' | 'analysis' | 'translation'
export type RoleType = 'assistant' | 'expert' | 'teacher' | 'analyst' 