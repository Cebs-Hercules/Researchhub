"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, ChevronDown, User, LogOut, Settings, BookOpen, Home, FileText } from "lucide-react"
import SearchBar from "./search-bar"

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (query) => {
    setSearchQuery(query)
    // Redirect to search results page
    window.location.href = `/search?q=${encodeURIComponent(query)}`
  }

  // Update the desktop navigation menu to be more comprehensive with dropdowns
  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled ? "bg-white shadow-md" : "bg-white/80 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-800">Research Hub</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6">
            <div className="w-64">
              <SearchBar placeholder="Search papers..." onSearch={handleSearch} className="hidden md:block" />
            </div>
            <nav className="flex space-x-4 ml-4">
              {/* Main Navigation Links */}
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center space-x-1">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </span>
              </Link>

              {/* Papers Dropdown */}
              <div className="relative group">
                <button
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                    pathname.startsWith("/blogs") || pathname.startsWith("/search")
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Papers</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100 hidden group-hover:block animate-in fade-in slide-in-from-top-5 duration-200">
                  <Link href="/blogs" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Browse All Papers
                  </Link>
                  <Link href="/search" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Advanced Search
                  </Link>
                  {session && (
                    <Link
                      href="/dashboard/blogs/new"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Submit New Paper
                    </Link>
                  )}
                </div>
              </div>

              {/* Researchers Link */}
              <Link
                href="/researchers"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith("/researchers")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Researchers</span>
                </span>
              </Link>

              {/* Dashboard Dropdown for authenticated users */}
              {session && (
                <div className="relative group">
                  <button
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                      pathname.startsWith("/dashboard")
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Dashboard</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                  <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100 hidden group-hover:block animate-in fade-in slide-in-from-top-5 duration-200">
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Dashboard Home
                    </Link>
                    <Link
                      href="/dashboard/blogs/new"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Upload New Paper
                    </Link>

                    {/* Verification links for appropriate roles */}
                    {(session?.user?.role === "Department Research Officer" ||
                      session?.user?.role === "Super-Admin") && (
                      <Link
                        href="/dashboard/verify"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Verification Queue
                      </Link>
                    )}

                    {/* Admin links */}
                    {session?.user?.role === "Super-Admin" && (
                      <>
                        <div className="border-t border-gray-100 my-1"></div>
                        <Link
                          href="/dashboard/admin/users"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          User Management
                        </Link>
                        <Link
                          href="/dashboard/admin/blogs"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          All Research Papers
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </nav>
          </div>

          <div className="hidden md:flex md:items-center">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{session.user.name}</span>
                      <span className="text-xs text-gray-500">{session.user.role}</span>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100 animate-in fade-in slide-in-from-top-5 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false)
                        signOut({ callbackUrl: "/" })
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-50 focus:outline-none"
            >
              <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - updated with more comprehensive navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top duration-200">
          <div className="px-4 pt-4 pb-2">
            <SearchBar placeholder="Search papers..." onSearch={handleSearch} />
          </div>
          <nav className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === "/"
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </span>
            </Link>

            {/* Papers section */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-base font-medium text-gray-700">
                <span className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Papers</span>
                </span>
              </div>
              <Link
                href="/blogs"
                className="block pl-10 pr-4 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse All Papers
              </Link>
              <Link
                href="/search"
                className="block pl-10 pr-4 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Advanced Search
              </Link>
              {session && (
                <Link
                  href="/dashboard/blogs/new"
                  className="block pl-10 pr-4 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Submit New Paper
                </Link>
              )}
            </div>

            {/* Researchers link */}
            <Link
              href="/researchers"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname.startsWith("/researchers")
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Researchers</span>
              </span>
            </Link>

            {/* Dashboard section for authenticated users */}
            {session && (
              <div className="space-y-1">
                <div className="px-3 py-2 text-base font-medium text-gray-700">
                  <span className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Dashboard</span>
                  </span>
                </div>
                <Link
                  href="/dashboard"
                  className="block pl-10 pr-4 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard Home
                </Link>
                <Link
                  href="/dashboard/blogs/new"
                  className="block pl-10 pr-4 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Upload New Paper
                </Link>

                {/* Verification links for appropriate roles */}
                {(session?.user?.role === "Department Research Officer" || session?.user?.role === "Super-Admin") && (
                  <Link
                    href="/dashboard/verify"
                    className="block pl-10 pr-4 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Verification Queue
                  </Link>
                )}

                {/* Admin links */}
                {session?.user?.role === "Super-Admin" && (
                  <>
                    <div className="pl-10 pr-4 py-1 border-t border-gray-100"></div>
                    <Link
                      href="/dashboard/admin/users"
                      className="block pl-10 pr-4 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      User Management
                    </Link>
                    <Link
                      href="/dashboard/admin/blogs"
                      className="block pl-10 pr-4 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      All Research Papers
                    </Link>
                  </>
                )}
              </div>
            )}
          </nav>

          {/* User profile section in mobile menu */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {session ? (
              <div className="px-4 space-y-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-semibold">
                    {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{session.user.name}</div>
                    <div className="text-sm font-medium text-gray-500">{session.user.email}</div>
                    <div className="text-sm font-medium text-gray-500">Role: {session.user.role}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/dashboard/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Profile Settings</span>
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      signOut({ callbackUrl: "/" })
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  >
                    <span className="flex items-center space-x-2">
                      <LogOut className="h-5 w-5" />
                      <span>Sign out</span>
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2 space-y-2">
                <Link
                  href="/auth/signin"
                  className="block w-full text-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="block w-full text-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
