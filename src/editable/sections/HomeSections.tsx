import Link from 'next/link'
import {
  ArrowRight,
  Bookmark,
  Building2,
  Camera,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  MapPin,
  Megaphone,
  Search,
  Share2,
  Star,
  UserRound,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref } from '@/editable/cards/PostCards'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  sbm: Bookmark,
  pdf: FileText,
  profile: UserRound,
}

const hiddenTaskKeys = new Set<TaskKey>(['classified', 'profile'])

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'

function getExcerpt(post?: SitePost | null, limit = 130) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

function categoryOf(post?: SitePost | null, fallback = 'General') {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || fallback
}

function getField(post: SitePost, keys: string[]) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  for (const key of keys) {
    const value = content[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function hashStr(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

function ratingOf(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const real = Number(content.rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.8 + (hashStr(post.slug || post.id || post.title || 'x') % 11) / 10) * 10) / 10
}

function reviewsOf(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const real = Number(content.reviewCount ?? content.reviews)
  if (real > 0) return Math.floor(real)
  return 24 + (hashStr((post.slug || post.title || 'x') + 'r') % 420)
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function directoryCount(task: TaskKey) {
  return 120 + (hashStr(task) % 6800)
}

function Stars({ rating, className = 'h-4 w-4' }: { rating: number; className?: string }) {
  const rounded = Math.round(rating)
  return (
    <span className="inline-flex items-center gap-[3px]" aria-label={`${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`${className} ${i < rounded ? 'fill-[var(--slot4-accent-fill)] text-[var(--slot4-accent-fill)]' : 'fill-[var(--editable-border)] text-[var(--editable-border)]'}`}
        />
      ))}
    </span>
  )
}

function DirectoryRating({ post }: { post: SitePost }) {
  const rating = ratingOf(post)
  return (
    <div className="mt-2 flex items-center gap-2">
      <Stars rating={rating} />
      <span className="text-sm font-semibold text-[var(--slot4-page-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--slot4-muted-text)]">({reviewsOf(post)} reviews)</span>
    </div>
  )
}

function CategoryTile({ task }: { task: (typeof SITE_CONFIG.tasks)[number] }) {
  const Icon = taskIcon[task.key] || FileText
  return (
    <Link
      href={task.route}
      className="group flex min-w-[148px] flex-col items-center gap-3 rounded-[1.5rem] border border-transparent px-4 py-7 text-center transition hover:border-[var(--editable-border)] hover:bg-white hover:shadow-[0_16px_40px_rgba(24,37,63,0.08)]"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--slot4-lavender)] text-[var(--slot4-accent)]">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-base font-semibold text-[var(--slot4-page-text)]">{task.label}</p>
        <p className="mt-1 text-sm text-cyan-500">({directoryCount(task.key)})</p>
      </div>
    </Link>
  )
}

function FeaturedBusinessCard({ post, href }: { post: SitePost; href: string }) {
  const image = getEditablePostImage(post)
  return (
    <Link href={href} className="group block overflow-hidden rounded-[1.75rem] border border-[var(--editable-border)] bg-white shadow-[0_18px_40px_rgba(24,37,63,0.06)] transition hover:-translate-y-1">
      <div className="relative aspect-[16/9] overflow-hidden bg-[var(--slot4-media-bg)]">
        <span className="absolute left-0 top-0 z-10 bg-[#ef3a2f] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white">Featured</span>
        <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold leading-snug text-[var(--slot4-page-text)]">{post.title}</h3>
        <DirectoryRating post={post} />
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 105)}</p>
      </div>
    </Link>
  )
}

function HorizontalListingCard({ post, href, featured = false }: { post: SitePost; href: string; featured?: boolean }) {
  const image = getEditablePostImage(post)
  const location = getField(post, ['location', 'address', 'city'])
  return (
    <Link href={href} className={`group flex flex-col overflow-hidden rounded-[1.5rem] border border-[var(--editable-border)] bg-white transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(24,37,63,0.08)] ${featured ? 'md:flex-row' : ''}`}>
      <div className={`relative shrink-0 overflow-hidden bg-[var(--slot4-media-bg)] ${featured ? 'md:w-[42%]' : ''}`}>
        <img src={image} alt={post.title} className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] ${featured ? 'aspect-[4/3] md:aspect-auto' : 'aspect-[16/10]'}`} loading="lazy" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--slot4-accent)]">
          <span>{categoryOf(post, 'Listing')}</span>
          {location ? <span className="inline-flex items-center gap-1 text-[var(--slot4-muted-text)]"><MapPin className="h-3.5 w-3.5" /> {location}</span> : null}
        </div>
        <h3 className="mt-2 text-xl font-semibold leading-snug text-[var(--slot4-page-text)]">{post.title}</h3>
        <DirectoryRating post={post} />
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, featured ? 170 : 110)}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--slot4-accent-fill)]">
          View details <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

function CompactListingCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group rounded-[1.25rem] border border-[var(--editable-border)] bg-white p-4 transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(24,37,63,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--slot4-accent)]">{categoryOf(post, 'Profile')}</p>
          <h3 className="mt-2 text-base font-semibold leading-snug text-[var(--slot4-page-text)]">{post.title}</h3>
        </div>
        <span className="rounded-full bg-[var(--slot4-lavender)] p-2 text-[var(--slot4-accent)]">
          <Share2 className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 90)}</p>
    </Link>
  )
}

function ImageFirstCard({ post, href }: { post: SitePost; href: string }) {
  const image = getEditablePostImage(post)
  return (
    <Link href={href} className="group block overflow-hidden rounded-[1.5rem] border border-[var(--editable-border)] bg-white transition hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(24,37,63,0.08)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]" loading="lazy" />
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--slot4-accent)]">{categoryOf(post, 'Visual')}</p>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-[var(--slot4-page-text)]">{post.title}</h3>
      </div>
    </Link>
  )
}

function EditorialArticleCard({ post, href }: { post: SitePost; href: string }) {
  const image = getEditablePostImage(post)
  return (
    <Link href={href} className="group block">
      <div className="aspect-[16/10] overflow-hidden rounded-[1.25rem] bg-[var(--slot4-media-bg)]">
        <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" />
      </div>
      <h3 className="mt-4 text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--slot4-page-text)]">{post.title}</h3>
      <p className="mt-3 line-clamp-2 text-base leading-7 text-[var(--slot4-muted-text)]">{getExcerpt(post, 110)}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-accent-fill)]">
        Read More <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  )
}

function SidebarList({ title, posts, primaryTask, primaryRoute }: { title: string; posts: SitePost[]; primaryTask: TaskKey; primaryRoute: string }) {
  return (
    <div className="rounded-[1.75rem] bg-[var(--slot4-gray)] p-6">
      <h3 className="text-[2rem] font-semibold tracking-[-0.04em] text-[var(--slot4-page-text)]">{title}</h3>
      <div className="mt-5 space-y-4">
        {posts.map((post) => (
          <Link key={post.id || post.slug} href={postHref(primaryTask, post, primaryRoute)} className="block border-b border-[var(--editable-border)] pb-4 last:border-b-0 last:pb-0">
            <p className="font-semibold text-[var(--slot4-page-text)]">{post.title}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--slot4-muted-text)]">{getField(post, ['location', 'address', 'city']) || getExcerpt(post, 65)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function EditableHomeHero({ primaryTask }: HomeSectionProps) {
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTaskKeys.has(task.key)).slice(0, 6)

  return (
    <section className="border-b border-[var(--editable-border)] bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_72%,#f3f8ff_100%)]">
      <div className={`${container} py-10 sm:py-12`}>
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">{pagesContent.home.hero.badge || 'Business directory'}</p>
          <h1 className="editable-display mt-4 text-balance text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--slot4-page-text)] sm:text-6xl">
            Business discovery with a cleaner magazine rhythm.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--slot4-muted-text)]">
            Search local businesses, explore fresh features, and move into longer reads without leaving the main discovery flow.
          </p>
        </div>

        <form action="/search" className="mx-auto mt-10 grid max-w-[760px] gap-3 rounded-[1.75rem] border border-[var(--editable-border)] bg-white p-3 shadow-[0_20px_55px_rgba(24,37,63,0.08)] md:grid-cols-[1.2fr_0.8fr_auto]">
          <label className="flex items-center gap-3 rounded-[1.25rem] border border-[var(--editable-border)] px-4 py-4">
            <Search className="h-5 w-5 text-[var(--slot4-accent)]" />
            <input
              name="q"
              placeholder="Looking for business directory"
              className="w-full bg-transparent text-sm font-medium text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]"
            />
          </label>
          <label className="flex items-center gap-3 rounded-[1.25rem] border border-[var(--editable-border)] px-4 py-4">
            <MapPin className="h-5 w-5 text-[var(--slot4-muted-text)]" />
            <input
              name="category"
              placeholder="Location"
              className="w-full bg-transparent text-sm font-medium text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]"
            />
          </label>
          <button className="inline-flex items-center justify-center rounded-[1.25rem] bg-[var(--slot4-page-text)] px-6 py-4 text-sm font-bold text-white transition hover:brightness-95">
            <Search className="h-5 w-5" />
          </button>
        </form>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--slot4-muted-text)]">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-[0_10px_20px_rgba(24,37,63,0.05)]">
            <Building2 className="h-4 w-4 text-[var(--slot4-accent)]" /> Explore {SITE_CONFIG.tasks.find((task) => task.key === primaryTask)?.label || 'Directory'}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-[0_10px_20px_rgba(24,37,63,0.05)]">
            <Camera className="h-4 w-4 text-[var(--slot4-accent-fill)]" /> Fresh visuals and features
          </span>
        </div>

        <div className="mt-12 overflow-x-auto">
          <div className="flex min-w-max items-start justify-center gap-4 rounded-[2rem] bg-white/70 px-3 py-5">
            {categories.map((task) => <CategoryTile key={task.key} task={task} />)}
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const featured = pool.slice(0, 4)
  if (!featured.length) return null

  return (
    <section className="bg-white">
      <div className={`${container} py-14`}>
        <div className="mb-8 border-t border-[var(--editable-border)] pt-8 text-center">
          <h2 className="text-[2.35rem] font-semibold tracking-[-0.05em] text-[var(--slot4-page-text)]">Featured Business</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((post) => (
            <FeaturedBusinessCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const lead = pool[0]
  const gridPosts = pool.slice(1, 7)
  const sidebarPosts = pool.slice(7, 13)
  if (!lead) return null

  return (
    <section className="bg-[var(--slot4-warm)]">
      <div className={`${container} py-14`}>
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <h2 className="text-[2.5rem] font-semibold tracking-[-0.05em] text-[var(--slot4-page-text)]">Latest Listing</h2>
            <div className="mt-6">
              <HorizontalListingCard post={lead} href={postHref(primaryTask, lead, primaryRoute)} featured />
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {gridPosts.map((post, index) =>
                index % 3 === 0 ? (
                  <ImageFirstCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                ) : (
                  <HorizontalListingCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                )
              )}
            </div>
          </div>
          <div className="space-y-6">
            <SidebarList title="Your Nearby Areas" posts={sidebarPosts.slice(0, 5)} primaryTask={primaryTask} primaryRoute={primaryRoute} />
            <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_18px_40px_rgba(24,37,63,0.06)]">
              <h3 className="text-[2rem] font-semibold tracking-[-0.04em] text-[var(--slot4-page-text)]">Rating & Reviews</h3>
              <div className="mt-5 space-y-4">
                {sidebarPosts.slice(5, 8).map((post) => (
                  <div key={post.id || post.slug} className="border-b border-[var(--editable-border)] pb-4 last:border-b-0 last:pb-0">
                    <p className="font-semibold text-[var(--slot4-page-text)]">{post.title}</p>
                    <DirectoryRating post={post} />
                    <p className="mt-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 72)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const articlePosts = pool.slice(0, 3)
  const compactPosts = pool.slice(3, 9)
  if (!pool.length) return null

  return (
    <>
      <section className="bg-white">
        <div className={`${container} py-14`}>
          <div className="text-center">
            <h2 className="text-[2.35rem] font-semibold tracking-[-0.05em] text-[var(--slot4-page-text)]">Latest Articles</h2>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {articlePosts.map((post) => (
              <EditorialArticleCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--slot4-warm)]">
        <div className={`${container} py-14`}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">Quick browse</p>
              <h2 className="mt-3 text-[2.2rem] font-semibold tracking-[-0.05em] text-[var(--slot4-page-text)]">More sections to explore</h2>
            </div>
            <Link href={primaryRoute} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-accent-fill)]">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {compactPosts.map((post) => (
              <CompactListingCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export function EditableHomeCta() {
  const quickLinks = SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTaskKeys.has(task.key)).slice(0, 8)

  return (
    <section id="get-app" className="scroll-mt-24 bg-white">
      <div className={`${container} py-14`}>
        <div className="rounded-[2rem] border border-[var(--editable-border)] bg-[var(--slot4-gray)] p-8 text-center shadow-[0_20px_50px_rgba(24,37,63,0.06)] sm:p-10">
          <p className="text-sm font-medium text-[var(--slot4-muted-text)]">Top Searches :</p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-[var(--slot4-muted-text)]">
            {quickLinks.map((task) => (
              <span key={task.key} className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--slot4-accent-fill)]/60" />
                {task.label}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/create" className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-7 py-3 text-sm font-bold text-white transition hover:brightness-95">
              Create a post
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-7 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
