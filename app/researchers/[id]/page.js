"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Mail, Building, BookOpen, Briefcase, Tag, ArrowLeft, Calendar } from "lucide-react"

export default function ResearcherProfile({ params }) {
  const router = useRouter()
  const [researcher, setResearcher] = useState(null)
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchResearcherData() {
      setLoading(true)
      setError(null)

      try {
        // Fetch researcher profile
        const profileResponse = await fetch(`/api/users/${params.id}`)

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch researcher profile")
        }

        const profileData = await profileResponse.json()
        setResearcher(profileData.user)

        // Fetch researcher's publications
        const publicationsResponse = await fetch(`/api/blogs?authorId=${params.id}&status=PUBLISHED`)

        if (!publicationsResponse.ok) {
          throw new Error("Failed to fetch publications")
        }

        const publicationsData = await publicationsResponse.json()
        setPublications(publicationsData.blogs || [])
      } catch (err) {
        console.error("Error fetching researcher data:", err)
        setError("Failed to load researcher profile. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchResearcherData()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error || !researcher) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || "Researcher not found"}</p>
          <Link href="/researchers" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">
            ← Back to researchers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/researchers" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to all researchers
      </Link>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-semibold">
              {researcher.name.charAt(0).toUpperCase()}
            </div>
            <div className="mt-4 md:mt-0 md:ml-6">
              <h1 className="text-3xl font-bold">{researcher.name}</h1>
              <p className="text-gray-600">{researcher.position || "Researcher"}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {researcher.email && (
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-600">{researcher.email}</p>
                </div>
              </div>
            )}

            {researcher.department && (
              <div className="flex items-start">
                <Building className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Department</p>
                  <p className="text-gray-600">{researcher.department}</p>
                </div>
              </div>
            )}

            {researcher.institution && (
              <div className="flex items-start">
                <Briefcase className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Institution</p>
                  <p className="text-gray-600">{researcher.institution}</p>
                </div>
              </div>
            )}
          </div>

          {researcher.bio && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Biography</h2>
              <p className="text-gray-700">{researcher.bio}</p>
            </div>
          )}

          {researcher.researchInterests && researcher.researchInterests.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Research Interests</h2>
              <div className="flex flex-wrap gap-2">
                {researcher.researchInterests.map((interest, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm">
                    <Tag className="h-3 w-3 inline mr-1" />
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Publications</h2>

        {publications.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-6 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No publications found for this researcher.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {publications.map((publication) => (
              <Link key={publication._id} href={`/blogs/${publication._id}`}>
                <div className="bg-white shadow-sm hover:shadow-md rounded-lg p-6 transition-all duration-200">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 hover:text-indigo-600 transition-colors">
                    {publication.title}
                  </h3>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(publication.publishedAt || publication.updatedAt)}</span>
                    </div>

                    {publication.keywords && publication.keywords.length > 0 && (
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        <span>{publication.keywords.slice(0, 3).join(", ")}</span>
                        {publication.keywords.length > 3 && <span> +{publication.keywords.length - 3}</span>}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4">{publication.abstract.substring(0, 200)}...</p>

                  <span className="text-indigo-600 font-medium hover:underline flex items-center">
                    View publication{" "}
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
