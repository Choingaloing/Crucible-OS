// Crucible Pro Marketing tab: shapes returned by GET /api/crucible-pro/marketing.

export const MARKETING_RANGES = ['7', '30', '90', 'mtd'] as const
export type MarketingRange = (typeof MARKETING_RANGES)[number]

export const MARKETING_RANGE_LABELS: Record<MarketingRange, string> = {
  '7': 'Last 7 days',
  '30': 'Last 30 days',
  '90': 'Last 90 days',
  mtd: 'Month to date',
}

export interface ClientDataSources {
  user_id: string
  google_ads_accounts: string[]
  gbp_locations: string[]
  gsc_property: string | null
  updated_at?: string
}

export interface AdsTotals {
  spend: number
  clicks: number
  impressions: number
  conversions: number
  phone_calls: number
}

export interface AdsCampaign extends AdsTotals {
  campaign: string
  channel: string
  status: string | null
}

export interface AdsDay {
  date: string
  spend: number
  clicks: number
  conversions: number
}

export interface GbpTotals {
  impressions: number
  call_clicks: number
  website_clicks: number
  direction_requests: number
}

export interface GbpReview {
  id: string
  reviewer: string | null
  rating: number | null
  comment: string | null
  created_at: string | null
  reply: string | null
}

export interface GbpPost {
  id: string
  summary: string | null
  created_at: string | null
  state: string | null
  topic: string | null
  image_url: string | null
  url: string | null
}

export interface GbpPhoto {
  id: string
  thumbnail_url: string | null
  url: string | null
  created_at: string | null
  views: number
}

export interface Section<T> {
  data: T | null
  error: string | null
}

export interface MarketingSummary {
  range: MarketingRange
  dates: { from: string; to: string }
  sources: ClientDataSources | null
  ads: Section<{
    search: AdsTotals
    lsa: AdsTotals
    campaigns: AdsCampaign[]
    daily: AdsDay[]
  }>
  gbp: Section<{
    totals: GbpTotals
    keywords: { keyword: string; searches: number }[]
    rating: number | null
    review_count: number | null
    reviews: GbpReview[]
    posts: GbpPost[]
    photos: GbpPhoto[]
  }>
}
