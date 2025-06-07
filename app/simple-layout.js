import { Inter } from "next/font/google"
import "./globals.css"
import { SimpleAuthProvider } from "@/components/simple-auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Blog Approval System",
  description: "Multi-stage blog approval system",
}

export default function SimpleLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SimpleAuthProvider>
          <header className="bg-white shadow-sm p-4 mb-4">
            <h1 className="text-xl font-bold">Blog Platform</h1>
          </header>
          <main className="container mx-auto px-4 py-8">{children}</main>
        </SimpleAuthProvider>
      </body>
    </html>
  )
}
