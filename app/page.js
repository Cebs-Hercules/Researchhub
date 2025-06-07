import Link from "next/link"
import { getPublishedBlogs } from "@/lib/blogs"
import { formatDate, truncateText } from "@/lib/utils"
import { FileText, Search, BookOpen, Users, TrendingUp } from "lucide-react"

// Prevent this page from being prerendered
export const dynamic = "force-dynamic"

export default async function Home() {
  // Get the latest published papers
  const recentPapers = await getPublishedBlogs(6)

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="py-12 md:py-20 -mt-8 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Discover Academic Research Papers</h1>
            <p className="text-xl text-gray-600 mb-8">
              Access a growing collection of peer-reviewed research papers from leading academics and researchers.
            </p>

            <div className="max-w-2xl mx-auto mb-8">
              <form action="/search" method="get">
                <div className="relative">
                  <input
                    type="text"
                    name="q"
                    placeholder="Search for research papers..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <button
                    type="submit"
                    className="absolute right-3 top-3 px-4 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/blogs"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Browse All Papers
              </Link>
              <Link
                href="/auth/signin"
                className="px-6 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
              >
                Submit Your Research
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Use Research Hub?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Research</h3>
              <p className="text-gray-600">
                Access peer-reviewed papers from leading academics and researchers across various disciplines.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rigorous Review Process</h3>
              <p className="text-gray-600">
                All papers undergo a multi-stage review process to ensure quality and academic integrity.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover Insights</h3>
              <p className="text-gray-600">Find the latest research and breakthroughs in your field of interest.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Papers Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Recent Research Papers</h2>
            <Link href="/blogs" className="text-indigo-600 hover:text-indigo-800 font-medium">
              View all papers →
            </Link>
          </div>

          {recentPapers.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No papers published yet</h3>
              <p className="text-gray-600 mb-4">Be the first to publish your research on our platform.</p>
              <Link
                href="/auth/signin"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Submit Your Research
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPapers.map((paper) => (
                <Link key={paper._id} href={`/blogs/${paper._id}`} className="block group">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                    <div className="p-6 flex-grow">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-600 transition-colors">
                        {paper.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span>{paper.author.name}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(paper.publishedAt || paper.updatedAt)}</span>
                      </div>
                      <p className="text-gray-600 mb-4">{truncateText(paper.abstract, 120)}</p>

                      {paper.keywords && paper.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-auto">
                          {paper.keywords.slice(0, 3).map((keyword, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                              {keyword}
                            </span>
                          ))}
                          {paper.keywords.length > 3 && (
                            <span className="text-gray-500 text-xs">+{paper.keywords.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                      <span className="text-indigo-600 font-medium group-hover:underline flex items-center">
                        Read paper{" "}
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
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Share Your Research?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join our community of researchers and academics to share your work with the world.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-md"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  )
}
