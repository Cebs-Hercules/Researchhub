import { getBlogById } from "@/lib/blogs"
import { formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"
import PdfViewer from "@/components/pdf-viewer"
import Link from "next/link"
import { Calendar, User, Tag, ArrowLeft, Download } from "lucide-react"

// Prevent this page from being prerendered
export const dynamic = "force-dynamic"

export default async function ResearchPaperPage({ params }) {
  let paper

  try {
    paper = await getBlogById(params.id)

    if (!paper || paper.status !== "PUBLISHED") {
      notFound()
    }
  } catch (error) {
    console.error("Error fetching research paper:", error)
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/blogs" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to all papers
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{paper.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            <span>
              {paper.author.name}
              {paper.authors && paper.authors.length > 0 && `, ${paper.authors.join(", ")}`}
            </span>
          </div>

          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(paper.publishedAt || paper.updatedAt)}</span>
          </div>

          <div className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Research Paper</div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Abstract */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Abstract</h2>
          <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
        </div>

        {/* Keywords */}
        {paper.keywords && paper.keywords.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {paper.keywords.map((keyword, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm">
                  <Tag className="h-3 w-3 inline mr-1" />
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* DOI if available */}
        {paper.doi && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">DOI</h2>
            <p className="text-gray-700">
              <a
                href={`https://doi.org/${paper.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                {paper.doi}
              </a>
            </p>
          </div>
        )}

        {/* PDF Viewer */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Research Paper</h2>
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </a>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <PdfViewer pdfUrl={paper.pdfUrl} />
          </div>
        </div>
      </div>
    </div>
  )
}
