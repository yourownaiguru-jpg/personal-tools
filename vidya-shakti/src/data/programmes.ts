import raw from './programmes.json'
import type { Programme } from '../lib/types'

export const meta = raw.meta
export const PROGRAMMES = raw.programmes as unknown as Programme[]
export const STREAMS: string[] = raw.meta.streams

export interface Goal { key: string; label: string; sub: string; streams: string[]; careerBreak: boolean }
export const GOALS: Goal[] = [
  { key: 'earn', label: 'Start earning soon', sub: 'Tailoring, beauty, food and other trades', streams: ['Vocational Trades (tailoring, beauty, food etc.)'], careerBreak: false },
  { key: 'biz', label: 'Start a business', sub: 'Entrepreneurship training and incubators', streams: ['Entrepreneurship & Business'], careerBreak: false },
  { key: 'tech', label: 'Move into tech', sub: 'IT, AI, cyber security and electronics', streams: ['Computer Science & IT', 'AI & Data Science', 'Cyber Security', 'Electrical Engineering', 'Electronics & Communication'], careerBreak: false },
  { key: 'study', label: 'Finish my education', sub: '10th, 12th, degrees and open learning', streams: ['Academic Degree (any subject)', 'Literacy & Basic Education'], careerBreak: false },
  { key: 'back', label: 'Return after a break', sub: 'Fellowships and returnships for career breaks', streams: [], careerBreak: true },
]

export type DateKind = 'Confirmed' | 'Expected' | 'Reported' | 'Scheduled'
export const DATES: { id: string; when: string; title: string; kind: DateKind }[] = [
  { id: 'P011', when: 'Mid-Nov 2026', title: 'SWAYAM / NPTEL enrolment for the Jan–Apr 2027 semester opens', kind: 'Expected' },
  { id: 'P025', when: '30 Nov 2026', title: 'DHR Women Scientist Fellowship (North-East): last date, 5 pm', kind: 'Confirmed' },
  { id: 'P027', when: 'Dec 2026', title: 'IGNOU January 2027 session: registration opens', kind: 'Expected' },
  { id: 'P007', when: 'Dec 2026', title: 'PMKVY 4.0 reported to end; PMKVY 5.0 expected in 2027', kind: 'Reported' },
  { id: 'P001', when: '31 Jan 2027', title: 'NIOS 10th and 12th admission: last date for Block 2', kind: 'Confirmed' },
  { id: 'P003', when: '31 Mar 2027', title: 'ULLAS adult literacy scheme period ends unless extended', kind: 'Scheduled' },
]
