export type LevelKey =
  | 'school_dropout' | 'class10_pass' | 'class12_pass'
  | 'undergraduate' | 'postgraduate' | 'doctorate_research'

export interface Programme {
  id: string
  name: string
  agency: string
  govt: 'Central' | 'State'
  states: string[] // ['All India'] or a list of states
  levels: LevelKey[]
  streams: string[]
  cost: 'Free' | 'Low-cost' | 'Paid stipend'
  cost_note: string
  mode: string
  women_only: boolean
  career_break: boolean
  window: string
  status: string
  eligibility: string
  official_url: string
  source_url: string
  notes: string
  last_checked: string
}

export type Kind = 'open' | 'expected' | 'none' | 'check'

export interface Filters {
  q: string
  level: LevelKey | ''
  state: string // '' = all, 'OTHER' = national only
  streams: string[]
  cost: Programme['cost'] | ''
  women: boolean
  careerBreak: boolean
  openOnly: boolean
}

export const EMPTY_FILTERS: Filters = {
  q: '', level: '', state: '', streams: [], cost: '',
  women: false, careerBreak: false, openOnly: false,
}
