import { NextResponse } from 'next/server'

// Simple proxy to fetch women-related news from NewsAPI
// Note: For production, move the API key to environment variables.

const NEWS_API_KEY = 'MTF9qHx6P8smNGWLHJH2EOVft61jZdZBP7Mrzh2t'
const NEWS_ENDPOINT = 'https://newsapi.org/v2/everything'

// Query terms related to women safety and related topics
const QUERY = [
  'women',
  'female',
  'girl',
  'women rights',
  'gender equality',
  'sexual harassment',
  'gender violence',
  'women safety',
  'domestic violence',
].join(' OR ')

export async function GET() {
  try {
    const url = new URL(NEWS_ENDPOINT)
    url.searchParams.set('q', QUERY)
    url.searchParams.set('language', 'en')
    url.searchParams.set('pageSize', '10')
    url.searchParams.set('sortBy', 'publishedAt')

    const res = await fetch(url.toString(), {
      headers: {
        'X-Api-Key': NEWS_API_KEY,
      },
      // Avoid caching at the edge; client handles caching policy
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: 'Upstream error', details: text }, { status: 502 })
    }

    const data = await res.json()

    const articles = (data.articles || []).map((a: any) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      urlToImage: a.urlToImage,
      source: a.source?.name,
      publishedAt: a.publishedAt,
    }))

    return NextResponse.json({ articles })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch news', details: error?.message }, { status: 500 })
  }
}


