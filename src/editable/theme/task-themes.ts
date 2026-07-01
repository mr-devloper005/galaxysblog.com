import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const base = {
  dark: false,
  fontDisplay: "'Fraunces', Georgia, serif",
  fontBody: "'Plus Jakarta Sans', system-ui, sans-serif",
  bg: '#f8fbff',
  surface: '#ffffff',
  raised: '#eef5ff',
  text: '#18253f',
  muted: '#5f6f8d',
  line: '#d9e5fb',
  accent: '#5409da',
  accentSoft: '#bbfbff',
  onAccent: '#ffffff',
  glow: 'rgba(78,113,255,0.18)',
  radius: '1.5rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Journal', note: 'Longer reads arranged with a cleaner magazine rhythm.' },
  listing: { ...base, kicker: 'Directory', note: 'Browse business profiles in a search-first directory view.' },
  classified: { ...base, kicker: 'Marketplace', note: 'Offers, notices, and quick opportunities in one place.' },
  image: { ...base, kicker: 'Gallery', note: 'Image-led posts framed like a discovery board.' },
  sbm: { ...base, kicker: 'Resources', note: 'Curated links and saved references worth revisiting.' },
  pdf: { ...base, kicker: 'Library', note: 'Structured documents presented as a public archive.' },
  profile: { ...base, kicker: 'Profiles', note: 'People, teams, and business identities with context.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': '#4e71ff',
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
