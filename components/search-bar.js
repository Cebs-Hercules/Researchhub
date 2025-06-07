"use client"

import { useState } from "react"
import { Search } from "lucide-react"

export default function SearchBar({ placeholder = "Search...", onSearch, className = "" }) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch && query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
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
  )
}
