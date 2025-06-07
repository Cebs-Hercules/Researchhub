"use client"

import { useState, useEffect } from "react"
import { Loader2, FileText, ExternalLink } from "lucide-react"

export default function PdfViewer({ pdfUrl }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Reset states when URL changes
    setIsLoading(true)
    setError(null)
  }, [pdfUrl])

  if (!pdfUrl) {
    return <div className="text-center py-10 text-gray-500">No PDF available</div>
  }

  // Handle iframe load events
  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setError("Failed to load PDF directly. Try using Google Docs Viewer or download it instead.")
  }

  // Use Google Docs Viewer as a fallback for better PDF compatibility
  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`

  return (
    <div className="pdf-viewer">
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mr-2" />
          <span className="text-gray-600">Loading PDF...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-6 bg-gray-50 border border-gray-200 rounded-md">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-700 mb-4">{error}</p>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">Viewing with Google Docs Viewer:</p>
            <iframe
              src={googleDocsViewerUrl}
              className="w-full h-[500px] border border-gray-300 rounded-md mx-auto"
              title="PDF Viewer (Google Docs)"
            ></iframe>
          </div>

          <div className="mt-4">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open PDF in New Tab
            </a>
          </div>
        </div>
      )}

      {!error && (
        <div className={isLoading ? "hidden" : ""}>
          <iframe
            src={pdfUrl}
            className="w-full h-[600px] border border-gray-300 rounded-md"
            title="PDF Viewer"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          ></iframe>
        </div>
      )}

      <div className="mt-4 text-center">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download PDF
        </a>
      </div>
    </div>
  )
}
