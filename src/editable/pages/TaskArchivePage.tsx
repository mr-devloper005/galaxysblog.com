import Link from 'next/link'
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, Download, FileText, Globe, MapPin, Phone, Search, Star, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const lead = posts[0]
  const mainPosts = lead ? posts.slice(1) : posts
  const sidebarPosts = posts.slice(0, 6)
  const archiveAdSlot: Record<TaskKey, 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer'> = {
    article: 'in-feed',
    listing: 'header',
    classified: 'in-feed',
    image: 'in-feed',
    sbm: 'footer',
    pdf: 'article-bottom',
    profile: 'sidebar',
  }
  const adSlot = archiveAdSlot[task]

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="border-b border-[var(--tk-line)] bg-white">
          <div className="mx-auto max-w-[var(--editable-container)] px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid items-center gap-4 xl:grid-cols-[220px_minmax(0,1fr)_220px_88px]">
              <div className="hidden rounded-[1.25rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] px-4 py-4 text-sm font-semibold text-[var(--tk-text)] xl:block">
                {label}
              </div>
              <form action={basePath} className="grid gap-3 xl:col-span-2 xl:grid-cols-[220px_minmax(0,1fr)_220px_auto]">
                <div className="relative">
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-14 w-full appearance-none rounded-[1.25rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] pl-4 pr-10 text-sm font-medium text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-accent)]"
                    aria-label={voice?.filterLabel || 'Filter category'}
                  >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                </div>
                <div className="flex items-center gap-3 rounded-[1.25rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] px-4">
                  <Search className="h-5 w-5 text-[var(--tk-accent)]" />
                  <span className="text-sm font-medium text-[var(--tk-muted)]">Looking For</span>
                </div>
                <div className="flex items-center gap-3 rounded-[1.25rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] px-4">
                  <MapPin className="h-5 w-5 text-[var(--tk-muted)]" />
                  <span className="text-sm font-medium text-[var(--tk-muted)]">Location</span>
                </div>
                <button className="inline-flex h-14 items-center justify-center rounded-[1.25rem] bg-[var(--tk-accent-fill)] px-6 text-sm font-semibold text-white transition hover:brightness-95">
                  <Search className="h-5 w-5" />
                </button>
              </form>
              <Link href="/login" className="hidden h-14 items-center justify-center rounded-[1.25rem] bg-[var(--editable-cta-bg)] px-5 text-sm font-semibold text-[var(--editable-cta-text)] xl:inline-flex">
                Sign In
              </Link>
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--tk-accent)]">{theme.kicker}</p>
                <h1 className="editable-display mt-3 text-[2.5rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--tk-text)] sm:text-6xl">
                  {voice?.headline || `Browse ${label}`}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--tk-muted)]">{voice?.description || theme.note}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[var(--tk-muted)]">
                  <span><strong className="text-[var(--tk-text)]">{posts.length}</strong> results</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--tk-muted)]/40" />
                  <span>{categoryLabel}</span>
                </div>
              </div>
              <ArchiveSidebar title="Your Nearby Areas" posts={sidebarPosts} />
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8">
          {adSlot === 'header' || adSlot === 'in-feed' ? (
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot={adSlot} showLabel eager className="mx-auto w-full" />
            </div>
          ) : null}

          {lead ? (
            <div className="mb-6">
              <ArchiveLeadCard task={task} post={lead} basePath={basePath} />
            </div>
          ) : null}

          {posts.length ? (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {mainPosts.map((post, index) => <ArchivePostCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />)}
              </div>
              <div className="space-y-5">
                {adSlot === 'sidebar' ? (
                  <div className="mx-auto max-w-6xl px-4 py-6">
                    <Ads slot="sidebar" showLabel eager className="mx-auto w-full" />
                  </div>
                ) : null}
                <ReviewSidebar posts={posts.slice(0, 4)} />
                <CompactLinkList title="More to Explore" task={task} posts={posts.slice(4, 10)} basePath={basePath} />
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-[var(--tk-radius)] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-2xl font-semibold tracking-[-0.02em]">Nothing here yet</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Try another category, or check back after new {label.toLowerCase()} are published.</p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-14 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--tk-line)] bg-white px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">Previous</Link> : null}
              <span className="rounded-full border border-[var(--tk-line)] bg-white px-5 py-2.5 font-medium text-[var(--tk-muted)]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-[var(--tk-line)] bg-white px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function hrefFor(task: TaskKey, basePath: string, slug?: string) {
  return slug ? `${basePath}/${slug}` : buildPostUrl(task, slug || '')
}

function ArchiveLeadCard({ task, post, basePath }: { task: TaskKey; post: SitePost; basePath: string }) {
  const href = hrefFor(task, basePath, post.slug)
  const image = getImage(post)
  const location = getField(post, ['location', 'address', 'city'])
  return (
    <Link href={href} className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-[var(--tk-line)] bg-white shadow-[0_22px_55px_rgba(24,37,63,0.08)] transition hover:-translate-y-1 lg:flex-row">
      <div className="relative overflow-hidden bg-[var(--tk-raised)] lg:w-[42%]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tk-accent)]">
          <span>{getCategory(post, task)}</span>
          {location ? <span className="inline-flex items-center gap-1 text-[var(--tk-muted)]"><MapPin className="h-3.5 w-3.5" /> {location}</span> : null}
        </div>
        <h2 className="editable-display mt-4 text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-[var(--tk-text)] sm:text-[2.4rem]">{post.title}</h2>
        <RatingLine post={post} />
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--tk-accent)]">View details <ArrowUpRight className="h-4 w-4" /></span>
      </div>
    </Link>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = hrefFor(task, basePath, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} compact={index % 3 !== 0} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return index % 4 === 0 ? <ArticleArchiveCard post={post} href={href} index={index} featured /> : <ArticleArchiveCard post={post} href={href} index={index} />
}

function ArchiveSidebar({ title, posts }: { title: string; posts: SitePost[] }) {
  return (
    <aside className="rounded-[1.75rem] bg-[var(--tk-gray,var(--tk-raised))] p-6">
      <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-[var(--tk-text)]">{title}</h2>
      <div className="mt-5 space-y-4">
        {posts.map((post) => (
          <div key={post.id || post.slug} className="border-b border-[var(--tk-line)] pb-4 last:border-b-0 last:pb-0">
            <p className="font-semibold text-[var(--tk-text)]">{post.title}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--tk-muted)]">{getField(post, ['location', 'address', 'city']) || getSummary(post).slice(0, 70)}</p>
          </div>
        ))}
      </div>
    </aside>
  )
}

function ReviewSidebar({ posts }: { posts: SitePost[] }) {
  return (
    <div className="rounded-[1.75rem] border border-[var(--tk-line)] bg-white p-6 shadow-[0_16px_40px_rgba(24,37,63,0.05)]">
      <h3 className="text-[1.9rem] font-semibold tracking-[-0.04em] text-[var(--tk-text)]">Rating & Reviews</h3>
      <div className="mt-5 space-y-5">
        {posts.map((post) => (
          <div key={post.id || post.slug} className="border-b border-[var(--tk-line)] pb-4 last:border-b-0 last:pb-0">
            <p className="font-semibold text-[var(--tk-text)]">{post.title}</p>
            <RatingLine post={post} />
            <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post).slice(0, 92)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CompactLinkList({ title, task, posts, basePath }: { title: string; task: TaskKey; posts: SitePost[]; basePath: string }) {
  return (
    <div className="rounded-[1.75rem] border border-[var(--tk-line)] bg-white p-6 shadow-[0_16px_40px_rgba(24,37,63,0.05)]">
      <h3 className="text-[1.7rem] font-semibold tracking-[-0.04em] text-[var(--tk-text)]">{title}</h3>
      <div className="mt-4 grid gap-3">
        {posts.map((post) => (
          <Link key={post.id || post.slug} href={hrefFor(task, basePath, post.slug)} className="rounded-[1.25rem] bg-[var(--tk-raised)] px-4 py-4 transition hover:bg-[var(--tk-accent-soft)]">
            <p className="font-semibold text-[var(--tk-text)]">{post.title}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post).slice(0, 74)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}
const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.8 + (hashStr(post.slug || post.id || post.title || 'x') % 11) / 10) * 10) / 10
}
const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 12 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function RatingLine({ post, center = false }: { post: SitePost; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-2.5 flex items-center gap-2 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--tk-accent-fill,var(--tk-accent))] text-[var(--tk-accent-fill,var(--tk-accent))]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">({reviewsOf(post)})</span>
    </div>
  )
}

function ArticleArchiveCard({ post, href, index, featured = false }: { post: SitePost; href: string; index: number; featured?: boolean }) {
  const image = getImage(post)
  const category = getCategory(post, 'Article')
  return (
    <Link href={href} className={`group block overflow-hidden rounded-[1.5rem] border border-[var(--tk-line)] bg-white transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(24,37,63,0.08)] ${featured ? 'md:col-span-2' : ''}`}>
      <div className={`overflow-hidden bg-[var(--tk-raised)] ${featured ? 'aspect-[16/8]' : 'aspect-[16/10]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-accent)]">
          <span>{category}</span>
          <span className="text-[var(--tk-muted)]">No. {String(index + 1).padStart(2, '0')}</span>
        </div>
        <h2 className="editable-display mt-3 text-2xl font-semibold leading-snug tracking-[-0.03em] text-[var(--tk-text)]">{post.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href, compact = false }: { post: SitePost; href: string; compact?: boolean }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className={`group rounded-[1.5rem] border border-[var(--tk-line)] bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(24,37,63,0.08)] ${compact ? 'block' : 'flex items-center gap-5'}`}>
      <div className={`overflow-hidden rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] ${compact ? 'mb-4 aspect-[16/10] w-full' : 'flex h-24 w-24 shrink-0 items-center justify-center'}`}>
        {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <BriefcaseBusiness className="m-auto h-9 w-9 text-[var(--tk-muted)]" />}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="editable-display text-xl font-semibold tracking-[-0.02em] text-[var(--tk-text)]">{post.title}</h2>
        <RatingLine post={post} />
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-[var(--tk-muted)]">
          {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Website</span> : null}
        </div>
      </div>
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className="group flex flex-col rounded-[1.5rem] border border-[var(--tk-line)] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(24,37,63,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-3xl font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</span>
        {condition ? <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">{condition}</span> : null}
      </div>
      <h2 className="editable-display mt-5 text-xl font-semibold leading-snug tracking-[-0.02em] text-[var(--tk-text)]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <div className="mt-6 flex items-center justify-between border-t border-[var(--tk-line)] pt-4 text-xs font-medium text-[var(--tk-muted)]">
        <span className="inline-flex items-center gap-1.5">{location ? <><MapPin className="h-3.5 w-3.5" /> {location}</> : 'Details inside'}</span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)] transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link href={href} className="group block overflow-hidden rounded-[1.5rem] border border-[var(--tk-line)] bg-white transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(24,37,63,0.08)]">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(24,37,63,0.78))]" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h2 className="editable-display line-clamp-2 text-lg font-semibold leading-snug tracking-[-0.02em] text-white">{post.title}</h2>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className="group flex gap-4 rounded-[1.5rem] border border-[var(--tk-line)] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(24,37,63,0.08)]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Globe className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Saved {String(index + 1).padStart(2, '0')}</span>
        <h2 className="editable-display mt-1.5 text-lg font-semibold leading-snug tracking-[-0.02em] text-[var(--tk-text)]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        {website ? <p className="mt-3 truncate text-xs font-medium text-[var(--tk-accent)]">{cleanDomain(website)}</p> : null}
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const category = getCategory(post, 'Document')
  return (
    <Link href={href} className="group flex flex-col rounded-[1.5rem] border border-[var(--tk-line)] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(24,37,63,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-6 w-6" /></div>
        <span className="rounded-full border border-[var(--tk-line)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{category}</span>
      </div>
      <h2 className="editable-display mt-6 text-xl font-semibold leading-snug tracking-[-0.02em] text-[var(--tk-text)]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">Open document <Download className="h-4 w-4" /></span>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className="group flex flex-col items-center rounded-[1.5rem] border border-[var(--tk-line)] bg-white p-7 text-center transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(24,37,63,0.08)]">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />}
      </div>
      <h2 className="editable-display mt-5 text-lg font-semibold tracking-[-0.02em] text-[var(--tk-text)]">{post.title}</h2>
      {role ? <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
      <RatingLine post={post} center />
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}
