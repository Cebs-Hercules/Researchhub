"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, User, ChevronLeft, ChevronRight, Loader2, Filter, BookOpen } from "lucide-react"

export default function ResearchersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""
  const page = Number.parseInt(searchParams.get("page") || "1", 10)
  const department = searchParams.get("department") || ""

  const [researchers, setResearchers] = useState([])
  const [departments, setDepartments] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchResearchers() {
      setLoading(true)
      setError(null)

      try {
        const searchQuery = query ? `&q=${encodeURIComponent(query)}` : ""
        const departmentQuery = department ? `&department=${encodeURIComponent(department)}` : ""
        const response = await fetch(`/api/users/researchers?page=${page}${searchQuery}${departmentQuery}`)

        if (!response.ok) {
          throw new Error("Failed to fetch researchers")
        }

        const data = await response.json()
        setResearchers(data.researchers)
        setPagination(data.pagination)

        // Get unique departments for the filter
        if (data.departments) {
          setDepartments(data.departments)
        }
      } catch (err) {
        console.error("Error fetching researchers:", err)
        setError("Failed to load researchers. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchResearchers()
  }, [query, page, department])

  const handleSearch = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const searchQuery = formData.get("q")

    let url = `/researchers?page=1`
    if (searchQuery) {
      url += `&q=${encodeURIComponent(searchQuery)}`
    }
    if (department) {
      url += `&department=${encodeURIComponent(department)}`
    }

    router.push(url)
  }

  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value

    let url = `/researchers?page=1`
    if (query) {
      url += `&q=${encodeURIComponent(query)}`
    }
    if (selectedDepartment) {
      url += `&department=${encodeURIComponent(selectedDepartment)}`
    }

    router.push(url)
  }

  const handlePageChange = (newPage) => {
    let url = `/researchers?page=${newPage}`
    if (query) {
      url += `&q=${encodeURIComponent(query)}`
    }
    if (department) {
      url += `&department=${encodeURIComponent(department)}`
    }

    router.push(url)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Researchers</h1>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <form onSubmit={handleSearch} className="w-full md:w-96">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search researchers..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-600 hover:text-indigo-800"
              >
                Search
              </button>
            </div>
          </form>

          {departments.length > 0 && (
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <select
                value={department}
                onChange={handleDepartmentChange}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}
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
      ) : researchers.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No researchers found</h2>
          {query || department ? (
            <p className="text-gray-600 mb-4">Try adjusting your search criteria.</p>
          ) : (
            <p className="text-gray-600 mb-4">There are no researchers available yet.</p>
          )}
          <Link href="/" className="text-indigo-600 hover:text-indigo-800">
            Return to home page
          </Link>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {researchers.map((researcher) => (
              <Link key={researcher._id} href={`/researchers/${researcher._id}`}>
                <div className="bg-white shadow-sm hover:shadow-md rounded-lg overflow-hidden transition-all duration-200 h-full flex flex-col">
                  <div className="p-6 flex-grow">
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-semibold">
                        {researcher.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <h2 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                          {researcher.name}
                        </h2>
                        <p className="text-sm text-gray-500">{researcher.position || "Researcher"}</p>
                      </div>
                    </div>

                    {researcher.department && (
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">Department:</span> {researcher.department}
                      </p>
                    )}

                    {researcher.institution && (
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">Institution:</span> {researcher.institution}
                      </p>
                    )}

                    {researcher.researchInterests && researcher.researchInterests.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Research Interests:</p>
                        <div className="flex flex-wrap gap-2">
                          {researcher.researchInterests.slice(0, 3).map((interest, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                              {interest}
                            </span>
                          ))}
                          {researcher.researchInterests.length > 3 && (
                            <span className="text-gray-500 text-xs">
                              +{researcher.researchInterests.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center">
                      <BookOpen className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">{researcher.publicationCount || 0} publications</span>
                    </div>
                  </div>
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                    <span className="text-indigo-600 font-medium hover:underline flex items-center">
                      View profile{" "}
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
