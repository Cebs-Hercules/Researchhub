import Link from "next/link"
import { getPublishedBlogs } from "@/lib/blogs"
import { formatDate, truncateText } from "@/lib/utils"

// Make this component handle its own data fetching
export default async function PublishedBlogs({ limit = 0 }) {
  // Wrap the data fetching in a try/catch to handle errors gracefully
  let papers = []

  try {
    papers = await getPublishedBlogs(limit)
  } catch (error) {
    console.error("Error fetching published research papers:", error)
    // Return a fallback UI in case of error
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Failed to load research papers. Please try again later.</p>
      </div>
    )
  }

  if (papers.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No published research papers yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {papers.map((paper) => (
        <Link key={paper._id} href={`/blogs/${paper._id}`} className="block group">
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold group-hover:text-indigo-600 transition-colors duration-300">
                  {paper.title}
                </h3>
                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  Research
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                By {paper.author.name} • {formatDate(paper.publishedAt || paper.updatedAt)}
              </p>
              <p className="text-gray-600 mb-4">{truncateText(paper.abstract || "", 120)}</p>
              <span className="text-indigo-600 font-medium group-hover:underline">View Research Paper</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
