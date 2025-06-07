import Link from "next/link"

export default function SimplePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Simple Test Page</h1>
      <p>This is a simple page with minimal dependencies.</p>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Links</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <Link href="/api/health" className="text-blue-600 hover:underline">
              API Health Check
            </Link>
          </li>
          <li>
            <Link href="/api/db-test" className="text-blue-600 hover:underline">
              Database Connection Test
            </Link>
          </li>
          <li>
            <Link href="/minimal" className="text-blue-600 hover:underline">
              Minimal Page
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
