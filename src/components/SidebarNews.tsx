"use client"

import { useEffect, useState } from "react"
import { newsService, type NewsArticle } from "@/services/news"
import Link from "next/link"

export function SidebarNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [nextUpdateAt, setNextUpdateAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const { articles, nextUpdateAt } = await newsService.getNews()
        if (!isMounted) return
        setArticles(articles)
        setNextUpdateAt(nextUpdateAt)
        setError(null)
      } catch (e: any) {
        setError(e?.message || 'Failed to load news')
      }
    })()

    // Timer to update countdown every second; does not fetch
    const interval = setInterval(() => setTick((x) => x + 1), 1000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const remaining = nextUpdateAt ? Math.max(0, nextUpdateAt - Date.now()) : 0
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  return (
    <div className="p-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-sidebar-foreground/70">Women-related News</span>
        <span className="text-[10px] text-sidebar-foreground/60">
          {nextUpdateAt ? `Next update in ${minutes}:${String(seconds).padStart(2, "0")}` : ""}
        </span>
      </div>
      {error && (
        <div className="mb-2 text-[11px] text-red-600">{error}</div>
      )}
      <div className="space-y-2">
        {articles.slice(0, 6).map((a, idx) => (
          <Link
            key={`${a.url}-${idx}`}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <p className="text-xs font-medium leading-snug line-clamp-2">{a.title}</p>
            {a.source && (
              <p className="mt-1 text-[10px] text-sidebar-foreground/60">{a.source}</p>
            )}
          </Link>
        ))}
        {articles.length === 0 && !error && (
          <div className="text-xs text-sidebar-foreground/60">No news available right now.</div>
        )}
      </div>
    </div>
  )
}


