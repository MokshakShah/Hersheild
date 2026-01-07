export interface NewsArticle {
  title: string
  description: string | null
  url: string
  urlToImage?: string | null
  source?: string | null
  publishedAt?: string | null
}


class NewsService {
  private readonly STORAGE_KEY = 'newsCache:v2';
  private readonly TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_ARTICLES = 100;
  private readonly KEYWORDS = [
    'women', 'female', 'girl', 'gender', 'assault', 'harassment', 'violence', 'rights', 'safety', 'domestic',
    'politics', 'sport', 'athlete', 'fashion', 'model', 'actress', 'film', 'movie', 'celebrity', 'leadership',
    'empowerment', 'education', 'health', 'career', 'business', 'startup', 'technology', 'science', 'achievement',
    'award', 'inspiration', 'success', 'entrepreneur', 'artist', 'music', 'literature', 'activist', 'social', 'trend',
    'mother', 'daughter', 'wife', 'sister', 'transgender', 'LGBTQ', 'equality', 'representation', 'inclusion', 'diversity'
  ];

  private filterArticles(articles: NewsArticle[]): NewsArticle[] {
    // Score articles by keyword frequency (TF-IDF-like)
    return articles
      .map(article => {
        const text = `${article.title} ${article.description ?? ''}`.toLowerCase();
        let score = 0;
        for (const keyword of this.KEYWORDS) {
          // Count keyword frequency
          const matches = text.match(new RegExp(`\\b${keyword}\\b`, 'g'));
          if (matches) score += matches.length;
        }
        return { ...article, _score: score };
      })
      .filter(a => a._score > 0)
      .sort((a, b) => b._score - a._score);
  }

  private prioritizeLatest(articles: NewsArticle[]): NewsArticle[] {
    // Sort by publishedAt (latest first)
    return articles
      .filter(a => a.publishedAt)
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime());
  }

  async getNews(): Promise<{ articles: NewsArticle[]; nextUpdateAt: number }> {
    const now = Date.now();
    try {
      const cachedRaw = localStorage.getItem(this.STORAGE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as {
          articles: NewsArticle[];
          fetchedAt: number;
        };
        const age = now - cached.fetchedAt;
        if (age < this.TTL_MS) {
          // Use cached articles, prioritize latest, limit to MAX_ARTICLES
          const filtered = this.filterArticles(cached.articles);
          const sorted = this.prioritizeLatest(filtered);
          return {
            articles: sorted.slice(0, this.MAX_ARTICLES),
            nextUpdateAt: cached.fetchedAt + this.TTL_MS
          };
        }
      }
    } catch {}

    // Fetch new articles from API
    const res = await fetch('/api/news?pageSize=100', { cache: 'no-store' });
    if (!res.ok) {
      let details = '';
      try { details = await res.text(); } catch {}
      console.error('News API proxy error:', res.status, details);
      throw new Error(`Failed to load news (${res.status})`);
    }
    const data = await res.json();
    // Filter and prioritize
    const filtered = this.filterArticles(data?.articles ?? []);
    const sorted = this.prioritizeLatest(filtered);
    const payload = {
      articles: sorted.slice(0, this.MAX_ARTICLES),
      fetchedAt: now,
    };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
    } catch {}
    return {
      articles: payload.articles,
      nextUpdateAt: now + this.TTL_MS
    };
  }
}

export const newsService = new NewsService()


