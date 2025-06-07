"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function ProfileSettings() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [user, setUser] = useState(null)
  const [name, setName] = useState("")
  const [department, setDepartment] = useState("")
  const [position, setPosition] = useState("")
  const [bio, setBio] = useState("")
  const [institution, setInstitution] = useState("")
  const [researchInterests, setResearchInterests] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/dashboard/profile")
      return
    }

    async function fetchUserProfile() {
      try {
        const response = await fetch("/api/users/profile")

        if (!response.ok) {
          throw new Error("Failed to fetch user profile")
        }

        const data = await response.json()
        setUser(data.user)
        setName(data.user.name || "")
        setDepartment(data.user.department || "")
        setPosition(data.user.position || "")
        setBio(data.user.bio || "")
        setInstitution(data.user.institution || "")
        setResearchInterests(data.user.researchInterests ? data.user.researchInterests.join(", ") : "")
      } catch (error) {
        setError("Error loading profile: " + error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [session, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          department,
          position,
          bio,
          institution,
          researchInterests: researchInterests
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile")
      }

      setSuccess("Profile updated successfully")

      // Update the session with the new name
      if (name !== session.user.name) {
        await update({
          ...session,
          user: {
            ...session.user,
            name,
          },
        })
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-900">
          Back to Dashboard
        </Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-4 rounded-md">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <input
            id="department"
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Computer Science, Engineering, etc."
          />
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
            Title/Position
          </label>
          <input
            id="position"
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Professor, Associate Professor, Researcher, etc."
          />
        </div>

        <div>
          <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
            Institution
          </label>
          <input
            id="institution"
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., University of Example, Research Institute, etc."
          />
        </div>

        <div>
          <label htmlFor="researchInterests" className="block text-sm font-medium text-gray-700 mb-1">
            Research Interests (comma separated)
          </label>
          <input
            id="researchInterests"
            type="text"
            value={researchInterests}
            onChange={(e) => setResearchInterests(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Machine Learning, Artificial Intelligence, Data Science"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="A brief description about yourself and your research"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}
