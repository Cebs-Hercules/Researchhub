import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser, ROLES } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongoose"
import { formatDate } from "@/lib/utils"
import User from "@/models/User"

// Prevent this page from being prerendered
export const dynamic = "force-dynamic"

export default async function UserManagement() {
  let user
  let users = []

  try {
    user = await getCurrentUser()

    if (!user) {
      redirect("/auth/signin?callbackUrl=/dashboard/admin/users")
    }

    if (user.role !== ROLES.SUPER_ADMIN) {
      redirect("/unauthorized")
    }

    await connectToDatabase()
    const dbUsers = await User.find({}).sort({ createdAt: -1 }).lean()

    users = dbUsers.map((user) => ({
      ...user,
      _id: user._id.toString(),
      id: user._id.toString(),
      password: undefined, // Remove password from the response
    }))
  } catch (error) {
    console.error("Error in user management:", error)
    users = []
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-900">
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">All Users</h2>
          <Link
            href="/dashboard/admin/users/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Add New User
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created
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
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/admin/users/${user._id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
