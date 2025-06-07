import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser, ROLES } from "@/lib/auth"
import { getBlogsByStatus } from "@/lib/blogs"
import { formatDate, getStatusBadgeColor, getStatusLabel } from "@/lib/utils"

// Prevent this page from being prerendered
export const dynamic = "force-dynamic"

export default async function VerificationQueue() {
  let user
  let blogs = []

  try {
    user = await getCurrentUser()

    if (!user) {
      redirect("/auth/signin?callbackUrl=/dashboard/verify")
    }

    // Check if user has verification permissions
    if (![ROLES.DRO, ROLES.SUPER_ADMIN].includes(user.role)) {
      // redirect("/unauthorized")
      console.log('====================================');
      console.log(ROLES);
      console.log('====================================');
    }

    // Determine which status to filter by based on user role
    let statusToVerify

    switch (user.role) {
      case ROLES.DRO:
        statusToVerify = "PENDING_DRO"
        break
      case ROLES.SUPER_ADMIN:
        statusToVerify = "PENDING_ADMIN"
        break
    }

    blogs = await getBlogsByStatus(statusToVerify)
  } catch (error) {
    console.error("Error in verification queue:", error)
    blogs = []
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Verification Queue</h1>
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-900">
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Blogs Pending Your Verification</h2>

        {blogs.length === 0 ? (
          <p className="text-gray-500">No blogs are currently pending your verification.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Author
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Submitted
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blogs.map((blog) => (
                  <tr key={blog._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{blog.author.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(blog.status)}`}
                      >
                        {getStatusLabel(blog.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(blog.updatedAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/blogs/${blog._id}`} className="text-indigo-600 hover:text-indigo-900">
                        Verify
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
