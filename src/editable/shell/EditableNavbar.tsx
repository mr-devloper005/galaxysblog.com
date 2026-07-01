'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BriefcaseBusiness,
  Building2,
  FileText,
  Image as ImageIcon,
  LogIn,
  Menu,
  Search,
  UserPlus,
  UserRound,
  X,
} from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const hiddenTaskKeys = new Set(['classified', 'profile'])

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const navItems = useMemo(
    () => SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTaskKeys.has(task.key)).map((task) => ({ label: task.label, href: task.route })),
    []
  )
  const navIcons = [Building2, BriefcaseBusiness, FileText, ImageIcon, UserRound]

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--editable-border)] bg-[var(--editable-nav-bg)]/95 text-[var(--editable-nav-text)] shadow-[0_12px_40px_rgba(24,37,63,0.06)] backdrop-blur-md">
      <div className="h-[3px] bg-[linear-gradient(90deg,transparent_0%,var(--slot4-accent)_12%,var(--slot4-accent-fill)_50%,transparent_100%)]" />

      <nav className="mx-auto flex min-h-[72px] w-full max-w-[var(--editable-container)] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--slot4-accent)]/20 bg-[var(--slot4-surface-bg)] transition group-hover:border-[var(--slot4-accent)]">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-8 w-8 object-contain" />
          </span>
          <span className="min-w-0">
            <span className="editable-display block max-w-[220px] truncate text-[2rem] font-semibold leading-none tracking-[-0.04em]">{SITE_CONFIG.name}</span>
            <span className="mt-1 hidden max-w-[220px] truncate text-[10px] font-medium uppercase tracking-[0.26em] text-[var(--slot4-muted-text)] sm:block">
              {globalContent.nav?.tagline || SITE_CONFIG.tagline}
            </span>
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-7 xl:flex">
          {navItems.slice(0, 5).map((item, index) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = navIcons[index] || Building2
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-1 px-1 py-3 text-center text-[11px] font-semibold transition ${
                  active ? 'text-[var(--slot4-accent)]' : 'text-[var(--slot4-muted-text)] hover:text-[var(--slot4-page-text)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {active ? <span className="absolute inset-x-0 top-0 h-[2px] bg-[var(--slot4-accent)]" /> : null}
              </Link>
            )
          })}
        </div>

        <form action="/search" className="hidden min-w-0 flex-1 justify-center lg:flex xl:hidden">
          <label className="flex w-full max-w-md items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-3 transition focus-within:border-[var(--slot4-accent)]">
            <Search className="h-4 w-4 shrink-0 text-[var(--slot4-accent)]" />
            <input
              name="q"
              type="search"
              placeholder="Search listings and articles"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[var(--slot4-muted-text)]"
            />
          </label>
        </form>

        <div className="ml-auto flex shrink-0 items-stretch gap-0 border-l border-[var(--editable-border)] pl-3 sm:pl-4">
          {session ? (
            <>
              <Link
                href="/create"
                className="hidden items-center bg-[var(--editable-cta-bg)] px-5 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--editable-cta-text)] transition hover:brightness-95 sm:inline-flex"
              >
                Publish
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden items-center px-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)] lg:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center gap-2 bg-[var(--editable-cta-bg)] px-5 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--editable-cta-text)] transition hover:brightness-95 sm:inline-flex"
              >
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
              <Link
                href="/signup"
                className="hidden items-center gap-2 border-r border-[var(--editable-border)] px-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)] lg:inline-flex"
              >
                <UserPlus className="h-4 w-4" /> Join
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex min-h-[69px] min-w-[80px] flex-col items-center justify-center gap-1 bg-[#1f6689] px-4 text-white"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="text-xs font-semibold">Menu</span>
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--editable-nav-bg)] px-4 py-5 xl:hidden">
          <form action="/search" className="mb-5 flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-3">
            <Search className="h-4 w-4 text-[var(--slot4-accent)]" />
            <input name="q" type="search" placeholder="Search posts" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--slot4-muted-text)]" />
          </form>
          <div className="grid gap-1">
            {[{ label: 'Home', href: '/' }, ...navItems, { label: 'Contact', href: '/contact' }, ...(session ? [{ label: 'Create', href: '/create' }] : [{ label: 'Login', href: '/login' }, { label: 'Sign up', href: '/signup' }])].map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] ${
                    active
                      ? 'bg-[var(--slot4-lavender)] text-[var(--slot4-accent)]'
                      : 'text-[var(--slot4-muted-text)] hover:bg-[var(--slot4-surface-bg)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            {session ? (
              <button
                type="button"
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
                className="rounded-2xl px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.12em] text-[var(--slot4-muted-text)] hover:bg-[var(--slot4-surface-bg)]"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
