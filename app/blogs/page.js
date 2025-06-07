"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { formatDate, truncateText } from "@/lib/utils"
import SearchBar from "@/components/search-bar"
import { FileText, Calendar, User, ChevronLeft, ChevronRight, Loader2, Filter } from "lucide-react"

export default function BlogsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""
  const page = Number.parseInt(searchParams.get("page") || "1", 10)

  const [papers, setPapers] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState("recent")

  useEffect(() => {
    async function fetchPapers() {
      setLoading(true)
      setError(null)

      try {
        const searchQuery = query ? `&q=${encodeURIComponent(query)}` : ""
        const response = await fetch(`/api/search?status=public${searchQuery}&page=${page}`)

        if (!response.ok) {
          throw new Error("Failed to fetch research papers")
        }

        const data = await response.json()
        setPapers(data.results)
        setPagination(data.pagination)
      } catch (err) {
        console.error("Error fetching papers:", err)
        setError("Failed to load research papers. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchPapers()
  }, [query, page])

  const handleSearch = (newQuery) => {
    router.push(`/blogs?q=${encodeURIComponent(newQuery)}`)
  }

  const handlePageChange = (newPage) => {
    const queryParam = query ? `&q=${encodeURIComponent(query)}` : ""
    router.push(`/blogs?page=${newPage}${queryParam}`)
  }

  const sortedPapers = [...papers].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.publishedAt || b.updatedAt) - new Date(a.publishedAt || a.updatedAt)
    } else if (sortBy === "title") {
      return a.title.localeCompare(b.title)
    }
    return 0
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Research Papers</h1>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="w-full md:w-96">
            <SearchBar placeholder="Search research papers..." onSearch={handleSearch} initialValue={query} />
          </div>

          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-400 mr-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="recent">Most Recent</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No research papers found</h2>
          {query ? (
            <p className="text-gray-600 mb-4">We couldn't find any research papers matching "{query}".</p>
          ) : (
            <p className="text-gray-600 mb-4">There are no published research papers available yet.</p>
          )}
          <Link href="/" className="text-indigo-600 hover:text-indigo-800">
            Return to home page
          </Link>
        </div>
      ) : (
        <>
          {query && (
            <p className="text-gray-600 mb-6">
              Found {pagination.total} {pagination.total === 1 ? "result" : "results"} for "{query}"
            </p>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPapers.map((paper) => (
              <Link key={paper._id} href={`/blogs/${paper._id}`}>
                <div className="bg-white shadow-sm hover:shadow-md rounded-lg overflow-hidden transition-all duration-200 h-full flex flex-col">
                  <div className="p-6 flex-grow">
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
                    </div>

                    <p className="text-gray-600 mb-4">{truncateText(paper.abstract, 150)}</p>

                    {paper.keywords && paper.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {paper.keywords.slice(0, 3).map((keyword, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                            {keyword}
                          </span>
                        ))}
                        {paper.keywords.length > 3 && (
                          <span className="text-gray-500 text-xs">+{paper.keywords.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                    <span className="text-indigo-600 font-medium hover:underline flex items-center">
                      Read paper{" "}
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-12">
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
