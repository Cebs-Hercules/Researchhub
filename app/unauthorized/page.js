import Link from "next/link"

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-xl text-gray-600 mb-8">You do not have permission to access this page.</p>
      <Link href="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md">
        Return to Home
      </Link>
    </div>
  )
}
