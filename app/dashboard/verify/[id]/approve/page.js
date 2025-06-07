"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function ApproveBlog({ params }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [blog, setBlog] = useState(null)
  const [comments, setComments] = useState("")
  const [verifyLink, setVerifyLink] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchBlog() {
      try {
        setIsLoading(true)
        setError("")

        console.log("Fetching blog with ID:", params.id)
        const response = await fetch(`/api/blogs/${params.id}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("API response error:", response.status, errorData)
          throw new Error(`Failed to fetch blog: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Blog data received:", data)
        setBlog(data.blog)
      } catch (error) {
        console.error("Error loading blog:", error)
        setError("Error loading blog: " + error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlog()
  }, [params.id])

  const handleApprove = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/blogs/${params.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comments, verifyLink }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify blog")
      }

      router.push("/dashboard/verify?success=Blog verified successfully")
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>
  }

  if (error && !blog) {
    return <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
  }

  const isDRO = session?.user?.role === "Department Research Officer"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Verify Blog</h1>
        <Link href={`/dashboard/blogs/${params.id}`} className="text-indigo-600 hover:text-indigo-900">
          Back to Blog
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          <p className="mt-2 text-sm">Please try refreshing the page or contact support if the issue persists.</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">{blog?.title}</h2>
        <p className="text-gray-500 mb-6">By {blog?.author.name}</p>

        {/* Display the research paper link if available */}
        {blog?.link && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-md font-medium mb-2">Research Paper Link</h3>
            <div className="flex items-center justify-between">
              <a
                href={blog.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 break-all"
              >
                {blog.link}
              </a>
              {blog.linkVerified ? (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Verified</span>
              ) : (
                isDRO && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="verifyLink"
                      checked={verifyLink}
                      onChange={(e) => setVerifyLink(e.target.checked)}
                      className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="verifyLink" className="text-sm text-gray-700">
                      Verify this link
                    </label>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleApprove} className="space-y-6">
          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Comments (optional)
            </label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add any comments or feedback for the author"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              href={`/dashboard/blogs/${params.id}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? "Verifying..." : "Verify Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
