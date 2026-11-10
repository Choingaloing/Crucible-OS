import { daysBack, num, rangeDates, sameAccount, windsorRows, type WindsorRow } from '@/lib/windsor'
import type {
  AdsCampaign,
  AdsDay,
  AdsTotals,
  ClientDataSources,
  GbpPhoto,
  GbpPost,
  GbpReview,
  MarketingRange,
  MarketingSummary,
  Section,
} from '@/types/marketing'

// Google Ads reports Local Services Ads as their own campaign channel.
const LSA_CHANNELS = new Set(['LOCAL_SERVICES', 'LOCAL SERVICES'])

const STAR: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }

const emptyTotals = (): AdsTotals => ({ spend: 0, clicks: 0, impressions: 0, conversions: 0, phone_calls: 0 })

function addTo(t: AdsTotals, r: WindsorRow) {
  t.spend += num(r.spend)
  t.clicks += num(r.clicks)
  t.impressions += num(r.impressions)
  t.conversions += num(r.conversions)
  t.phone_calls += num(r.phone_calls)
}

const str = (v: unknown) => (v == null || v === '' ? null : String(v))

async function section<T>(fn: () => Promise<T>): Promise<Section<T>> {
  try {
    return { data: await fn(), error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to load' }
  }
}

async function loadAds(accounts: string[], dates: { from: string; to: string }) {
  const mine = (r: WindsorRow) => accounts.some((a) => sameAccount(r.account_id, a))
  const [campaignRows, dailyRows] = await Promise.all([
    windsorRows(
      'google_ads',
      ['account_id', 'campaign', 'advertising_channel_type', 'campaign_status', 'spend', 'clicks', 'impressions', 'conversions', 'phone_calls'],
      dates,
    ),
    windsorRows('google_ads', ['account_id', 'date', 'spend', 'clicks', 'conversions'], dates),
  ])

  const search = emptyTotals()
  const lsa = emptyTotals()
  const byCampaign = new Map<string, AdsCampaign>()
  for (const r of campaignRows.filter(mine)) {
    const channel = String(r.advertising_channel_type ?? '').toUpperCase()
    addTo(LSA_CHANNELS.has(channel) ? lsa : search, r)
    const name = String(r.campaign ?? 'Unnamed campaign')
    const key = `${name}|${channel}`
    const c = byCampaign.get(key) ?? { campaign: name, channel, status: str(r.campaign_status), ...emptyTotals() }
    addTo(c, r)
    byCampaign.set(key, c)
  }

  const byDay = new Map<string, AdsDay>()
  for (const r of dailyRows.filter(mine)) {
    const date = String(r.date ?? '').slice(0, 10)
    if (!date) continue
    const d = byDay.get(date) ?? { date, spend: 0, clicks: 0, conversions: 0 }
    d.spend += num(r.spend)
    d.clicks += num(r.clicks)
    d.conversions += num(r.conversions)
    byDay.set(date, d)
  }

  return {
    search,
    lsa,
    campaigns: Array.from(byCampaign.values()).sort((a, b) => b.spend - a.spend),
    daily: Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date)),
  }
}

async function loadGbp(locations: string[], dates: { from: string; to: string }) {
  const mine = (r: WindsorRow) => locations.some((l) => sameAccount(r.account_id, l))
  const content = daysBack(365)
  const [metricRows, keywordRows, reviewRows, postRows, photoRows] = await Promise.all([
    windsorRows('google_my_business', ['account_id', 'impressions', 'call_clicks', 'website_clicks', 'direction_requests'], dates),
    windsorRows('google_my_business', ['account_id', 'search_keyword', 'search_keyword_value'], dates),
    windsorRows(
      'google_my_business',
      ['account_id', 'review_id', 'review_reviewer', 'review_star_rating', 'review_comment', 'review_create_time', 'review_reply_comment', 'review_total_count', 'review_average_rating_total'],
      content,
    ),
    windsorRows(
      'google_my_business',
      ['account_id', 'post_id', 'post_summary', 'post_create_time', 'post_state', 'post_topic_type', 'post_media_google_url', 'post_search_url'],
      content,
    ),
    windsorRows(
      'google_my_business',
      ['account_id', 'media_id', 'media_thumbnail_url', 'media_google_url', 'media_create_time', 'media_view_count'],
      content,
    ),
  ])

  const totals = { impressions: 0, call_clicks: 0, website_clicks: 0, direction_requests: 0 }
  for (const r of metricRows.filter(mine)) {
    totals.impressions += num(r.impressions)
    totals.call_clicks += num(r.call_clicks)
    totals.website_clicks += num(r.website_clicks)
    totals.direction_requests += num(r.direction_requests)
  }

  const kw = new Map<string, number>()
  for (const r of keywordRows.filter(mine)) {
    const k = str(r.search_keyword)
    if (k) kw.set(k, (kw.get(k) ?? 0) + num(r.search_keyword_value))
  }
  const keywords = Array.from(kw.entries())
    .map(([keyword, searches]) => ({ keyword, searches }))
    .sort((a, b) => b.searches - a.searches)
    .slice(0, 10)

  const myReviews = reviewRows.filter(mine)
  let rating: number | null = null
  let reviewCount: number | null = null
  const reviews = new Map<string, GbpReview>()
  for (const r of myReviews) {
    if (r.review_average_rating_total != null) rating = num(r.review_average_rating_total)
    if (r.review_total_count != null) reviewCount = num(r.review_total_count)
    const id = str(r.review_id)
    if (!id || reviews.has(id)) continue
    const stars = r.review_star_rating
    reviews.set(id, {
      id,
      reviewer: str(r.review_reviewer),
      rating: typeof stars === 'number' ? stars : STAR[String(stars ?? '').toUpperCase()] ?? (num(stars) || null),
      comment: str(r.review_comment),
      created_at: str(r.review_create_time),
      reply: str(r.review_reply_comment),
    })
  }

  const posts = new Map<string, GbpPost>()
  for (const r of postRows.filter(mine)) {
    const id = str(r.post_id)
    if (!id || posts.has(id)) continue
    posts.set(id, {
      id,
      summary: str(r.post_summary),
      created_at: str(r.post_create_time),
      state: str(r.post_state),
      topic: str(r.post_topic_type),
      image_url: str(r.post_media_google_url),
      url: str(r.post_search_url),
    })
  }

  const photos = new Map<string, GbpPhoto>()
  for (const r of photoRows.filter(mine)) {
    const id = str(r.media_id)
    if (!id || photos.has(id)) continue
    photos.set(id, {
      id,
      thumbnail_url: str(r.media_thumbnail_url),
      url: str(r.media_google_url),
      created_at: str(r.media_create_time),
      views: num(r.media_view_count),
    })
  }

  const newest = <T extends { created_at: string | null }>(a: T, b: T) =>
    (b.created_at ?? '').localeCompare(a.created_at ?? '')

  return {
    totals,
    keywords,
    rating,
    review_count: reviewCount,
    reviews: Array.from(reviews.values()).sort(newest).slice(0, 8),
    posts: Array.from(posts.values()).sort(newest).slice(0, 6),
    photos: Array.from(photos.values()).sort(newest).slice(0, 12),
  }
}

export async function buildMarketingSummary(
  sources: ClientDataSources | null,
  range: MarketingRange,
): Promise<MarketingSummary> {
  const dates = rangeDates(range)
  const adsAccounts = sources?.google_ads_accounts?.filter(Boolean) ?? []
  const locations = sources?.gbp_locations?.filter(Boolean) ?? []

  const [ads, gbp] = await Promise.all([
    adsAccounts.length ? section(() => loadAds(adsAccounts, dates)) : Promise.resolve({ data: null, error: null }),
    locations.length ? section(() => loadGbp(locations, dates)) : Promise.resolve({ data: null, error: null }),
  ])

  return { range, dates, sources, ads, gbp }
}
