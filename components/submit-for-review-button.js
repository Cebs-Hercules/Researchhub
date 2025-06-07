"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SubmitForReviewButton({ blogId }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/blogs/${blogId}/submit`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit for review")
      }

      router.refresh()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit for Review"}
      </button>
    </div>
  )
}
