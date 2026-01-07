import { NextResponse } from 'next/server'

// Simple proxy to fetch women-related news from NewsAPI
// Note: For production, move the API key to environment variables.

// Use the provided NewsAPI key
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'YOUR_NEWSAPI_KEY_HERE'
const NEWS_ENDPOINT = 'https://newsapi.org/v2/everything'


// Query terms strictly for women-related news, excluding economics, finance, sports, etc.
const QUERY = [
  'women',
  'female',
  'girl',
  'women rights',
  'gender equality',
  'sexual harassment',
  'gender violence',
  'women safety',
  'domestic violence'
].map(term => `(${term})`).join(' OR ') +
  ' NOT (economics OR finance OR business OR stock OR market OR sports OR cricket OR football OR entertainment OR movie OR film OR celebrity OR politics OR election OR government OR technology OR science OR startup OR crypto OR bitcoin OR share OR investment OR trade OR trading)';



export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    // Always fetch up to 100 articles, paginating through NewsAPI (max 100 per their docs)
    const pageSize = 50; // NewsAPI max pageSize is 100, but some sources limit to 20/50
    const maxArticles = 100;
    let articles: any[] = [];
    let page = 1;
    let fetched = 0;
    let totalResults = 0;

    while (fetched < maxArticles) {
      const url = new URL(NEWS_ENDPOINT);
      url.searchParams.set('q', QUERY);
      url.searchParams.set('language', 'en');
      url.searchParams.set('pageSize', String(pageSize));
      url.searchParams.set('page', String(page));
      url.searchParams.set('sortBy', 'publishedAt');

      const res = await fetch(url.toString(), {
        headers: {
          'X-Api-Key': NEWS_API_KEY,
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json({ error: 'Upstream error', details: text }, { status: 502 });
      }

      const data = await res.json();
      totalResults = data.totalResults || totalResults;
      const batch = (data.articles || []).map((a: any) => ({
        title: a.title,
        description: a.description,
        url: a.url,
        urlToImage: a.urlToImage,
        source: a.source?.name,
        publishedAt: a.publishedAt,
      }));
      articles = articles.concat(batch);
      fetched += batch.length;
      if (batch.length < pageSize) break; // No more articles
      page += 1;
    }

    // Limit to maxArticles
    articles = articles.slice(0, maxArticles);

    return NextResponse.json({
      articles,
      totalResults,
      page: 1,
      pageSize: maxArticles
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch news', details: error?.message }, { status: 500 });
  }
}


