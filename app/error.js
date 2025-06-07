"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled error:", error)

    // Send error to our API
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error.toString(),
        stack: error.stack,
        url: window.location.href,
      }),
    }).catch(console.error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Something went wrong!</h1>
      <p className="text-xl text-gray-600 mb-8">We're sorry, but there was an error processing your request.</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md"
        >
          Try again
        </button>
        <Link href="/" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-md">
          Return to Home
        </Link>
      </div>
    </div>
  )
}
