"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatDate, getStatusBadgeColor, getStatusLabel } from "@/lib/utils";
import SearchBar from "@/components/search-bar";
import { Loader2, Filter, Trash2, Eye } from "lucide-react";

export default function AdminBlogs() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/dashboard/admin/blogs");
      return;
    }

    if (sessionStatus === "authenticated") {
      if (session.user.role !== "Super-Admin") {
        router.push("/unauthorized");
        return;
      }

      fetchPapers();
    }
  }, [sessionStatus, router, session]);

  const fetchPapers = async () => {
    try {
      const response = await fetch(`/api/search`);

      if (!response.ok) {
        throw new Error("Failed to fetch papers");
      }

      const data = await response.json();
      setPapers(data.results);
      setFilteredPapers(data.results);
    } catch (err) {
      console.error("Error fetching papers:", err);
      setError("Failed to load research papers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters whenever statusFilter or searchQuery changes
    let results = [...papers];

    // Filter by status
    if (statusFilter !== "all") {
      results = results.filter((paper) => paper.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (paper) =>
          paper.title.toLowerCase().includes(query) ||
          paper.abstract.toLowerCase().includes(query) ||
          paper.author.name.toLowerCase().includes(query) ||
          (paper.keywords &&
            paper.keywords.some((k) => k.toLowerCase().includes(query)))
      );
    }

    setFilteredPapers(results);
  }, [statusFilter, searchQuery, papers]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const confirmDelete = (paperId, paperTitle) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${paperTitle}"? This action cannot be undone.`
      )
    ) {
      window.location.href = `/api/blogs/${paperId}/delete`;
    }
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">All Research Papers</h1>
        <Link
          href="/dashboard"
          className="text-indigo-600 hover:text-indigo-900"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold">Manage Research Papers</h2>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <SearchBar
                placeholder="Search papers..."
                onSearch={handleSearch}
              />
            </div>

            <div className="relative">
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-gray-400 mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_HOD">Pending HOD</option>
                  <option value="PENDING_FACULTY">Pending Faculty</option>
                  <option value="PENDING_ADMIN">Pending Admin</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredPapers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No research papers found matching your criteria.
            </p>
          </div>
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
                    Updated
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
                {filteredPapers.map((paper) => (
                  <tr
                    key={paper._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {paper.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {paper.author.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          paper.status
                        )}`}
                      >
                        {getStatusLabel(paper.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(paper.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/blogs/${paper._id}`}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      <button
                        onClick={() => confirmDelete(paper._id, paper.title)}
                        className="inline-flex items-center text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
