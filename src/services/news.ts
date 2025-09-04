export interface NewsArticle {
  title: string
  description: string | null
  url: string
  urlToImage?: string | null
  source?: string | null
  publishedAt?: string | null
}

class NewsService {
  private readonly STORAGE_KEY = 'newsCache:v1'
  private readonly TTL_MS = 20 * 60 * 1000 // 20 minutes

  async getNews(): Promise<{ articles: NewsArticle[]; nextUpdateAt: number }> {
    const now = Date.now()
    try {
      const cachedRaw = localStorage.getItem(this.STORAGE_KEY)
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as {
          articles: NewsArticle[]
          fetchedAt: number
        }
        const age = now - cached.fetchedAt
        if (age < this.TTL_MS) {
          return { articles: cached.articles, nextUpdateAt: cached.fetchedAt + this.TTL_MS }
        }
      }
    } catch {}

    const res = await fetch('/api/news', { cache: 'no-store' })
    if (!res.ok) {
      let details = ''
      try { details = await res.text() } catch {}
      console.error('News API proxy error:', res.status, details)
      throw new Error(`Failed to load news (${res.status})`)
    }
    const data = await res.json()
    const payload = {
      articles: (data?.articles ?? []) as NewsArticle[],
      fetchedAt: now,
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload))
    } catch {}
    return { articles: payload.articles, nextUpdateAt: now + this.TTL_MS }
  }
}

export const newsService = new NewsService()


