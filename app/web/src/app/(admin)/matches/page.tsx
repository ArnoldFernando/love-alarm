"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart } from "lucide-react"
import type { Match } from "@/types"

export default function MatchesPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { data: matchesRes, isLoading } = useQuery({
    queryKey: ["admin-matches", search, page],
    queryFn: async () => {
      const res = await api.get("/admin/matches", {
        params: { search, page },
      })
      return res.data.data
    },
  })

  const matches: Match[] = matchesRes?.data ?? []
  const pagination = matchesRes?.pagination

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Heart className="w-4 h-4 text-rose-500" />
          <span>{pagination?.total ?? 0} total matches</span>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-md"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Matches</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : matches.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No matches found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left font-medium text-gray-500">User 1</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">User 2</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Chat Enabled</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Matched At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match) => (
                      <tr key={match.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {match.user1?.profile?.display_name || "-"}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {match.user1?.email}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {match.user2?.profile?.display_name || "-"}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {match.user2?.email}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              match.chat_enabled
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {match.chat_enabled ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(match.matched_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.current_page} of {pagination.last_page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.last_page}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
