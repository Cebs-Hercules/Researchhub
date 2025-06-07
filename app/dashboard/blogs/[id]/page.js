import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getCurrentUser, ROLES } from "@/lib/auth"
import { getBlogById } from "@/lib/blogs"
import { formatDate, getStatusBadgeColor, getStatusLabel } from "@/lib/utils"
import PdfViewer from "@/components/pdf-viewer"
import SubmitForVerificationButton from "@/components/submit-for-verification-button"

// Prevent this page from being prerendered
export const dynamic = "force-dynamic"

export default async function ResearchPaperDetail({ params }) {
  let user
  let paper

  try {
    user = await getCurrentUser()

    if (!user) {
      redirect("/auth/signin?callbackUrl=/dashboard")
    }

    paper = await getBlogById(params.id)

    if (!paper) {
      notFound()
    }
  } catch (error) {
    console.error("Error in research paper detail:", error)
    notFound()
  }

  // Check if user is the author or has a role that can review this paper
  const isAuthor = paper.author.id === user.id
  const canReview =
    // (user.role === ROLES.HOD && paper.status === "PENDING_HOD") ||
    // (user.role === ROLES.FACULTY && paper.status === "PENDING_FACULTY") ||
    (user.role === ROLES.DRO && paper.status === "PENDING_DRO") ||
    (user.role === ROLES.SUPER_ADMIN && paper.status === "PENDING_ADMIN")

  if (!isAuthor && !canReview && user.role !== ROLES.SUPER_ADMIN) {
    redirect("/unauthorized")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{paper.title}</h1>
        <div className="flex space-x-4">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-900">
            Back to Dashboard
          </Link>
          {isAuthor && paper.status === "DRAFT" && (
            <Link href={`/dashboard/blogs/${paper._id}/edit`} className="text-indigo-600 hover:text-indigo-900">
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span
              className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeColor(paper.status)}`}
            >
              {getStatusLabel(paper.status)}
            </span>
          </div>
          <div className="text-sm text-gray-500">Last updated: {formatDate(paper.updatedAt)}</div>
        </div>

        <div className="space-y-6">
          {/* Research Paper Details */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">Abstract</h2>
            <p className="text-gray-700">{paper.abstract}</p>
          </div>

          {paper.keywords && paper.keywords.length > 0 && (
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-2">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {paper.keywords.map((keyword, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {paper.authors && paper.authors.length > 0 && (
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-2">Authors</h2>
              <p className="text-gray-700">
                {paper.author.name} {paper.authors.length > 0 && `, ${paper.authors.join(", ")}`}
              </p>
            </div>
          )}

          {paper.doi && (
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-2">DOI</h2>
              <p className="text-gray-700">{paper.doi}</p>
            </div>
          )}

          {/* Display the research paper link if available */}
          {paper.link && (
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-2">Research Paper Link</h2>
              <div className="flex items-center">
                <a
                  href={paper.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 break-all"
                >
                  {paper.link}
                </a>
                {paper.linkVerified ? (
                  <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Verified</span>
                ) : (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                    Pending Verification
                  </span>
                )}
              </div>
            </div>
          )}

          {/* PDF Viewer */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Research Paper</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <PdfViewer pdfUrl={paper.pdfUrl} />
            </div>
          </div>
        </div>

        {/* Update the submit button */}
        {isAuthor && paper.status === "DRAFT" && (
          <div className="mt-8 flex justify-end">
            <SubmitForVerificationButton blogId={paper._id} />
          </div>
        )}

        {/* Update the verification actions */}
        {canReview && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Verification Actions</h2>
            <div className="flex space-x-4">
              <Link
                href={`/dashboard/verify/${paper._id}/approve`}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve
              </Link>
              <Link
                href={`/dashboard/verify/${paper._id}/reject`}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </Link>
            </div>
          </div>
        )}

        {/* Update the verification history */}
        {paper.verificationHistory && paper.verificationHistory.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Verification History</h2>
            <div className="space-y-4">
              {paper.verificationHistory.map((review, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(review.status)}`}
                    >
                      {getStatusLabel(review.status)}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                  </div>
                  <p className="text-sm mt-2">Verified by: {review.role}</p>
                  {review.comments && <p className="text-sm mt-2">Comments: {review.comments}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
