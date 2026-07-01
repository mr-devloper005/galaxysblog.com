'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const hiddenTaskKeys = new Set(['classified', 'profile'])

export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTaskKeys.has(task.key))
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()
  const siteLinks = [
    ['About', '/about'],
    ['Contact', '/contact'],
    ['Comments', '/comments'],
    ...(session ? [['Create', '/create']] : [['Login', '/login'], ['Sign up', '/signup']]),
  ]
  const searchTerms = [
    ...taskLinks.map((task) => `${task.label} near you`),
    `${SITE_CONFIG.name} business profiles`,
    'local services',
    'directory listings',
    'featured articles',
    'community updates',
  ]
  const footerColumns = [
    'brand',
    ...(taskLinks.length ? ['explore'] : []),
    ...(siteLinks.length || session ? ['site'] : []),
  ]
  const footerGridClass =
    footerColumns.length >= 3
      ? 'lg:grid-cols-[1.3fr_1fr_1fr]'
      : footerColumns.length === 2
        ? 'lg:grid-cols-[1.3fr_1fr]'
        : 'lg:grid-cols-1'

  return (
    <footer className="border-t border-[var(--editable-border)] bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-8 text-center shadow-[0_22px_60px_rgba(24,37,63,0.06)] sm:px-10">
          <p className="text-sm font-medium text-[var(--slot4-muted-text)]">Top Searches :</p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-2 text-sm text-[var(--slot4-muted-text)]">
            {searchTerms.map((term) => (
              <span key={term} className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--slot4-accent-fill)]/60" />
                {term}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-y border-[var(--editable-border)] bg-[var(--slot4-gray)]">
        <div className={`mx-auto grid max-w-[var(--editable-container)] gap-10 px-4 py-12 sm:px-6 lg:px-8 ${footerGridClass}`}>
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--slot4-accent)]/25 bg-[var(--slot4-surface-bg)]">
                <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-8 w-8 object-contain" />
              </span>
              <span className="editable-display text-2xl font-semibold tracking-[-0.04em]">{SITE_CONFIG.name}</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-7 text-[var(--slot4-muted-text)]">{globalContent.footer?.description || SITE_CONFIG.description}</p>
            <div className="mt-6 inline-flex rounded-full bg-[var(--slot4-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">
              Post Free Ads In India
            </div>
          </div>

          {taskLinks.length ? (
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--slot4-accent)]">Explore</h3>
              <div className="mt-4 grid gap-2">
                {taskLinks.map((task) => (
                  <Link key={task.key} href={task.route} className="inline-flex items-center gap-2 text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">
                    {task.label} <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {siteLinks.length || session ? (
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--slot4-accent)]">Site</h3>
              <div className="mt-4 grid gap-2">
                {siteLinks.map(([label, href]) => (
                  <Link key={href} href={href} className="text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">{label}</Link>
                ))}
                {session ? <button type="button" onClick={logout} className="text-left text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">Logout</button> : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="px-4 py-5 text-center text-xs font-medium tracking-[0.12em] text-[var(--slot4-muted-text)]">
        Copyright {year} {SITE_CONFIG.name}. All rights reserved.
      </div>
    </footer>
  )
}
