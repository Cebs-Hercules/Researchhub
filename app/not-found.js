import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
      <p className="text-xl text-gray-600 mb-8">The page you are looking for doesn't exist or has been moved.</p>
      <Link href="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md">
        Return to Home
      </Link>
    </div>
  )
}
