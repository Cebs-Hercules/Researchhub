"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  // Map error codes to user-friendly messages
  const errorMessages = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in. Only UPSA faculty emails are allowed.",
    Verification: "The verification link may have been used or is invalid.",
    OAuthSignin: "Error in the OAuth sign-in process.",
    OAuthCallback: "Error in the OAuth callback process.",
    OAuthCreateAccount: "Could not create OAuth account. Make sure you're using a valid UPSA faculty email.",
    EmailCreateAccount: "Could not create email account.",
    Callback: "Error in the callback process.",
    OAuthAccountNotLinked: "This email is already associated with another account.",
    EmailSignin: "Error sending the email sign-in link.",
    CredentialsSignin: "The email or password you entered is incorrect, or your email doesn't meet the requirements.",
    SessionRequired: "You must be signed in to access this page.",
    default: "An unexpected error occurred.",
  }

  const errorMessage = error ? errorMessages[error] || errorMessages.default : errorMessages.default

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-red-600">Authentication Error</h1>

        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          <p className="font-medium">Error: {error}</p>
          <p className="mt-2">{errorMessage}</p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-md">
          <p className="font-medium mb-2">Email Requirements:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Must be a UPSA faculty email (@upsamail.edu.gh)</li>
            <li>Student emails (containing numbers) are not permitted</li>
            <li>
              Example of valid email: <span className="font-mono">mannsir@upsamail.edu.gh</span>
            </li>
            <li>
              Example of invalid email: <span className="font-mono">10285442@upsamail.edu.gh</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col space-y-4">
          <Link
            href="/auth/signin"
            className="w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try signing in again
          </Link>

          <Link
            href="/"
            className="w-full text-center border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to home page
          </Link>
        </div>
      </div>
    </div>
  )
}
