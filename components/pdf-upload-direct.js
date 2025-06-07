"use client"

import { useState, useRef } from "react"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { Loader2, Upload, X, Check, FileText } from "lucide-react"

export default function PdfUploadDirect({ onUploadSuccess, existingPdfUrl = null, existingPdfId = null }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError("File size must be less than 10MB")
      return
    }

    setSelectedFile(file)
    setError("")
    handleUpload(file)
  }

  const handleUpload = async (file) => {
    setIsUploading(true)
    setUploadProgress(0)
    setError("")
    setUploadComplete(false)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      const result = await uploadToCloudinary(file)
      console.log("Upload result:", result)

      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadComplete(true)
      setIsUploading(false)

      if (onUploadSuccess) {
        onUploadSuccess({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type || "auto", // Use auto instead of raw
        })
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError(err.message || "Failed to upload PDF. Please try again.")
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setSelectedFile(null)
    setUploadComplete(false)
  }

  // Format file size to human-readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Upload Research Paper (PDF)</h3>
        {isUploading && (
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-indigo-600" />
            <span className="text-sm text-gray-500">Uploading: {Math.round(uploadProgress)}%</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
      )}

      {existingPdfUrl && !selectedFile && !uploadComplete && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-sm text-gray-700">Current PDF</span>
            </div>
            <a
              href={existingPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
            >
              View PDF
            </a>
          </div>
        </div>
      )}

      {!isUploading && !uploadComplete && !selectedFile && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 ${
            error ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50"
          } text-center cursor-pointer hover:bg-gray-100 transition-colors duration-200`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PDF only (max 10MB)</p>
        </div>
      )}

      {/* Show file preview immediately after selection, before upload starts */}
      {selectedFile && !isUploading && !uploadComplete && (
        <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-md border border-indigo-200 mr-3">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <div className="text-xs text-indigo-600">Ready to upload</div>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center mb-2">
            <div className="bg-white p-2 rounded-md border border-gray-200 mr-3">
              <FileText className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 truncate">{selectedFile?.name}</p>
              <p className="text-xs text-gray-500">{selectedFile && formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            Please wait while your PDF is being uploaded. This may take a moment depending on the file size.
          </p>
        </div>
      )}

      {uploadComplete && (
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-md border border-green-200 mr-3">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{selectedFile?.name}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <Check className="h-3 w-3 mr-1" /> Upload complete
                </p>
              </div>
            </div>
            <button onClick={resetFileInput} className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
              <X className="h-4 w-4 mr-1" />
              Change
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
