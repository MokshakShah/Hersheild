
"use client"
import { useEffect, useState } from 'react';
import { newsService, NewsArticle } from '../../services/news';
import Link from 'next/link';

export default function NewsPage() {
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [page, setPage] = useState(1);
  const [nextUpdateAt, setNextUpdateAt] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;
  const totalPages = Math.min(10, Math.ceil(allArticles.length / pageSize));

  useEffect(() => {
    setLoading(true);
    newsService.getNews()
      .then(({ articles, nextUpdateAt }) => {
        setAllArticles(articles);
        setNextUpdateAt(nextUpdateAt);
      })
      .finally(() => setLoading(false));
  }, []);

  // Paginate client-side
  const paginatedArticles = allArticles.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Women-Related News</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <ul className="space-y-6">
            {paginatedArticles.map((article, idx) => (
              <li key={idx} className="border rounded-lg p-4 bg-white dark:bg-gray-900 shadow">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold hover:underline">
                  {article.title}
                </a>
                <div className="text-sm text-gray-500 mb-2">
                  {article.source} &middot; {article.publishedAt ? new Date(article.publishedAt).toLocaleString() : ''}
                </div>
                {article.urlToImage && (
                  <img src={article.urlToImage} alt="news" className="w-full max-h-60 object-cover rounded mb-2" />
                )}
                <p>{article.description}</p>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center mt-8">
            <button
              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              &lt; Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next &gt;
            </button>
          </div>
        </>
      )}
    </div>
  );
}
