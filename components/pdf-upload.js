"use client"

import { useState } from "react"
import { CldUploadWidget } from "next-cloudinary"

export default function PdfUpload({ onUploadSuccess, existingPdfUrl = null }) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleUploadSuccess = (result) => {
    setIsUploading(false)
    setError("")
    setUploadProgress(0)

    if (result.info && result.info.secure_url) {
      onUploadSuccess({
        url: result.info.secure_url,
        publicId: result.info.public_id,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-medium">Upload Research Paper (PDF)</h3>
        {isUploading && (
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Uploading...</span>
            <div className="w-24 bg-gray-200 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {existingPdfUrl && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Current PDF:</p>
          <a
            href={existingPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            View Current PDF
          </a>
        </div>
      )}

      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{
          maxFiles: 1,
          resourceType: "auto",
          allowedFormats: ["pdf"],
          sources: ["local"],
          showAdvancedOptions: false,
          clientAllowedFormats: ["pdf"],
          maxFileSize: 20000000, // 20MB limit
          styles: {
            palette: {
              window: "#FFFFFF",
              windowBorder: "#90A0B3",
              tabIcon: "#4F46E5",
              menuIcons: "#5A616A",
              textDark: "#000000",
              textLight: "#FFFFFF",
              link: "#4F46E5",
              action: "#4F46E5",
              inactiveTabIcon: "#0E2F5A",
              error: "#F44235",
              inProgress: "#4F46E5",
              complete: "#20B832",
              sourceBg: "#F4F5F5",
            },
          },
        }}
        onUpload={handleUploadSuccess}
        onOpen={() => {
          setIsUploading(true)
          setUploadProgress(0)
        }}
        onClose={() => {
          if (isUploading) {
            setIsUploading(false)
            setUploadProgress(0)
          }
        }}
        onProgress={(progress) => {
          setUploadProgress(Math.round((progress.loaded / progress.total) * 100))
        }}
        onError={(error) => {
          setIsUploading(false)
          setUploadProgress(0)
          setError("Upload failed: " + (error.message || "Unknown error"))
          console.error("Cloudinary upload error:", error)
        }}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => {
              if (!isUploading) {
                open()
              }
            }}
            disabled={isUploading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : existingPdfUrl ? "Replace PDF" : "Upload PDF"}
          </button>
        )}
      </CldUploadWidget>

      {isUploading && (
        <p className="text-sm text-gray-500 mt-2">
          Please wait while your PDF is being processed. This may take a moment depending on the file size.
        </p>
      )}
    </div>
  )
}
