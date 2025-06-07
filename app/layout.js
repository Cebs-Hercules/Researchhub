import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import Header from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Research Hub - Academic Research Papers",
  description: "A platform for publishing and reviewing academic research papers",
    generator: 'dev'
}

// Add error logging
function logError(error, errorInfo) {
  console.error("Global error:", error)
  console.error("Error info:", errorInfo)

  // In production, you could send this to an error tracking service
  if (process.env.NODE_ENV === "production") {
    // Example: send to your backend API
    try {
      fetch("/api/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: error.toString(), info: errorInfo, stack: error.stack }),
      }).catch(console.error) // Catch fetch errors
    } catch (e) {
      console.error("Failed to log error:", e)
    }
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        <AuthProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
          <footer className="bg-white border-t border-gray-200 py-8">
            <div className="container mx-auto px-4">
              <div className="text-center text-gray-500 text-sm">
                <p>© {new Date().getFullYear()} Research Hub. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
