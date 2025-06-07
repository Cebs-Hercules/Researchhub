"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
// Import the new Vercel Blob upload component
import PdfUploadBlob from "@/components/pdf-upload-blob"

export default function NewResearchPaper() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [pdfData, setPdfData] = useState({ url: "", filename: "" })
  const [abstract, setAbstract] = useState("")
  const [keywords, setKeywords] = useState("")
  const [authors, setAuthors] = useState("")
  const [doi, setDoi] = useState("")
  const [link, setLink] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Update the handlePdfUpload function to capture the filename
  const handlePdfUpload = (data) => {
    setPdfData({
      url: data.url,
      filename: data.filename,
    })
  }

  // Update the handleSubmit function to include the filename
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title) {
      setError("Title is required")
      return
    }

    if (!pdfData.url) {
      setError("PDF upload is required")
      return
    }

    if (!abstract) {
      setError("Abstract is required")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          pdfUrl: pdfData.url,
          pdfFilename: pdfData.filename,
          link,
          abstract,
          keywords: keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          authors: authors
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean),
          doi,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create research paper")
      }

      router.push(`/dashboard/blogs/${data.blog.id}`)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Upload New Research Paper</h1>
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-900">
          Back to Dashboard
        </Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* Use the new Vercel Blob uploader */}
        <PdfUploadBlob onUploadSuccess={handlePdfUpload} />

        <div>
          <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-1">
            Abstract <span className="text-red-500">*</span>
          </label>
          <textarea
            id="abstract"
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter the abstract of your research paper"
            required
          />
        </div>

        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
            Keywords (comma separated)
          </label>
          <input
            id="keywords"
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., machine learning, artificial intelligence, neural networks"
          />
        </div>

        <div>
          <label htmlFor="authors" className="block text-sm font-medium text-gray-700 mb-1">
            Co-authors (comma separated, if any)
          </label>
          <input
            id="authors"
            type="text"
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., John Doe, Jane Smith"
          />
        </div>

        <div>
          <label htmlFor="doi" className="block text-sm font-medium text-gray-700 mb-1">
            DOI (if published)
          </label>
          <input
            id="doi"
            type="text"
            value={doi}
            onChange={(e) => setDoi(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., 10.1000/xyz123"
          />
        </div>

        <div>
          <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
            Research Paper Link (URL)
          </label>
          <input
            id="link"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="https://example.com/my-research-paper"
          />
          <p className="mt-1 text-sm text-gray-500">Provide a link to your published research paper if available</p>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  )
}
