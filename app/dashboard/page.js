"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { formatDate, getStatusBadgeColor, getStatusLabel } from "@/lib/utils"
import SearchBar from "@/components/search-bar"
import { FileText, Upload, Filter, Loader2 } from "lucide-react"

export default function Dashboard() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [papers, setPapers] = useState([])
  const [filteredPapers, setFilteredPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/dashboard")
      return
    }

    if (sessionStatus === "authenticated") {
      fetchPapers()
    }
  }, [sessionStatus, router])

  const fetchPapers = async () => {
    try {
      const response = await fetch(`/api/search?authorId=${session.user.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch papers")
      }

      const data = await response.json()
      setPapers(data.results)
      setFilteredPapers(data.results)
    } catch (err) {
      console.error("Error fetching papers:", err)
      setError("Failed to load your research papers. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Apply filters whenever statusFilter or searchQuery changes
    let results = [...papers]

    // Filter by status
    if (statusFilter !== "all") {
      results = results.filter((paper) => paper.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (paper) =>
          paper.title.toLowerCase().includes(query) ||
          paper.abstract.toLowerCase().includes(query) ||
          (paper.keywords && paper.keywords.some((k) => k.toLowerCase().includes(query))),
      )
    }

    setFilteredPapers(results)
  }, [statusFilter, searchQuery, papers])

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/dashboard/blogs/new"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload New Research Paper
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {session?.user?.name}</h2>
        <div className="flex flex-wrap gap-4">
          <p className="text-gray-600">
            <span className="font-medium">Role:</span> {session?.user?.role}
          </p>
          {session?.user?.department && (
            <p className="text-gray-600">
              <span className="font-medium">Department:</span> {session.user.department}
            </p>
          )}
          {session?.user?.position && (
            <p className="text-gray-600">
              <span className="font-medium">Position:</span> {session.user.position}
            </p>
          )}
        </div>
        <div className="mt-4">
          <Link href="/dashboard/profile" className="text-indigo-600 hover:text-indigo-900">
            Edit Profile Settings
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold">Your Research Papers</h2>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <SearchBar placeholder="Search your papers..." onSearch={handleSearch} />
            </div>

            <div className="relative">
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-gray-400 mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_HOD">Pending HOD</option>
                  <option value="PENDING_FACULTY">Pending Faculty</option>
                  <option value="PENDING_ADMIN">Pending Admin</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredPapers.length === 0 ? (
          <div className="text-center py-8">
            {papers.length === 0 ? (
              <>
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No research papers yet</h3>
                <p className="text-gray-500 mb-4">Get started by uploading your first research paper.</p>
                <Link
                  href="/dashboard/blogs/new"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Research Paper
                </Link>
              </>
            ) : (
              <>
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matching papers found</h3>
                <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Uploaded
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Keywords
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPapers.map((paper) => (
                  <tr key={paper._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{paper.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(paper.status)}`}
                      >
                        {getStatusLabel(paper.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(paper.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {paper.keywords && paper.keywords.length > 0 ? (
                          paper.keywords.slice(0, 3).map((keyword, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                              {keyword}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No keywords</span>
                        )}
                        {paper.keywords && paper.keywords.length > 3 && (
                          <span className="text-gray-500 text-xs">+{paper.keywords.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/blogs/${paper._id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View
                      </Link>
                      {paper.status === "DRAFT" && (
                        <Link
                          href={`/dashboard/blogs/${paper._id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(session?.user?.role === "HOD" ||
        session?.user?.role === "Faculty" ||
        session?.user?.role === "Super-Admin") && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Review Queue</h2>
          <Link href="/dashboard/review" className="text-indigo-600 hover:text-indigo-900 flex items-center">
            View research papers pending your review
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      )}

      {(session?.user?.role === "Department Research Officer" || session?.user?.role === "Super-Admin") && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Verification Queue</h2>
          <Link href="/dashboard/verify" className="text-indigo-600 hover:text-indigo-900 flex items-center">
            View research papers pending your verification
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      )}

      {session?.user?.role === "Super-Admin" && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Admin Tools</h2>
          <div className="space-y-2">
            <Link
              href="/dashboard/admin/users"
              className="block text-indigo-600 hover:text-indigo-900 flex items-center"
            >
              User Management
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
            <Link
              href="/dashboard/admin/blogs"
              className="block text-indigo-600 hover:text-indigo-900 flex items-center"
            >
              All Research Papers
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
