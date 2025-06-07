"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { formatDate, truncateText } from "@/lib/utils"
import SearchBar from "@/components/search-bar"
import { FileText, Calendar, Tag, User, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

export default function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""
  const page = Number.parseInt(searchParams.get("page") || "1", 10)

  const [results, setResults] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchResults() {
      if (!query) {
        setResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&status=public&page=${page}`)

        if (!response.ok) {
          throw new Error("Failed to fetch search results")
        }

        const data = await response.json()
        setResults(data.results)
        setPagination(data.pagination)
      } catch (err) {
        console.error("Search error:", err)
        setError("Failed to load search results. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query, page])

  const handleSearch = (newQuery) => {
    router.push(`/search?q=${encodeURIComponent(newQuery)}`)
  }

  const handlePageChange = (newPage) => {
    router.push(`/search?q=${encodeURIComponent(query)}&page=${newPage}`)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
        <SearchBar
          placeholder="Search research papers..."
          onSearch={handleSearch}
          className="max-w-2xl"
          initialValue={query}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <span className="ml-2 text-gray-600">Searching...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No results found</h2>
          <p className="text-gray-600 mb-4">We couldn't find any research papers matching "{query}".</p>
          <p className="text-gray-600">Try using different keywords or browse all papers.</p>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-4">
            Found {pagination.total} {pagination.total === 1 ? "result" : "results"} for "{query}"
          </p>

          <div className="space-y-6">
            {results.map((paper) => (
              <Link key={paper._id} href={`/blogs/${paper._id}`}>
                <div className="bg-white shadow-sm hover:shadow-md rounded-lg p-6 transition-all duration-200">
                  <h2 className="text-xl font-semibold mb-2 text-gray-900 hover:text-indigo-600 transition-colors">
                    {paper.title}
                  </h2>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>
                        {paper.author.name}
                        {paper.authors && paper.authors.length > 0 && `, ${paper.authors.join(", ")}`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(paper.publishedAt || paper.updatedAt)}</span>
                    </div>
                    {paper.keywords && paper.keywords.length > 0 && (
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        <span>{paper.keywords.slice(0, 3).join(", ")}</span>
                        {paper.keywords.length > 3 && <span> +{paper.keywords.length - 3}</span>}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600">{truncateText(paper.abstract, 200)}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  // Calculate page numbers to show
                  let pageNum
                  if (pagination.pages <= 5) {
                    pageNum = i + 1
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i
                  } else {
                    pageNum = pagination.page - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-md ${
                        pagination.page === pageNum
                          ? "bg-indigo-600 text-white"
                          : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  )
}
