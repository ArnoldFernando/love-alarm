"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ["admin-users", search, page],
    queryFn: async () => {
      const res = await api.get("/admin/users", {
        params: { search, page },
      })
      return res.data.data
    },
  })

  const users = usersRes?.data ?? []
  const pagination = usersRes?.pagination

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50"
      case "suspended":
        return "text-orange-600 bg-orange-50"
      case "banned":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Users</h1>

      <div className="flex gap-4">
        <Input
          placeholder="Search by email, username, or display name..."
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
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left font-medium text-gray-500">User</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Email</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Role</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Status</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Joined</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {user.profile?.display_name || "-"}
                          </div>
                          <div className="text-gray-500 text-xs">
                            @{user.profile?.username || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className="capitalize text-gray-700">{user.role}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                              user.account_status
                            )}`}
                          >
                            {user.account_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/users/${user.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
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
