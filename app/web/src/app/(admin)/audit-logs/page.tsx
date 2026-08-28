"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AuditLogsPage() {
  const [actionFilter, setActionFilter] = useState("")
  const [page, setPage] = useState(1)

  const { data: logsRes, isLoading } = useQuery({
    queryKey: ["admin-audit-logs", actionFilter, page],
    queryFn: async () => {
      const params: any = { page }
      if (actionFilter) params.action = actionFilter
      const res = await api.get("/admin/audit-logs", { params })
      return res.data.data
    },
  })

  const logs = logsRes?.data ?? []
  const pagination = logsRes?.pagination

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>

      <div className="flex gap-4">
        <Input
          placeholder="Filter by action (e.g., USER_BANNED)..."
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value)
            setPage(1)
          }}
          className="max-w-md"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
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
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Action</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Actor</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Entity</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">IP Address</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log: any) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {log.actor?.email || "System"}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {log.entity_type ? `${log.entity_type} (${log.entity_id})` : "-"}
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                          {log.ip_address || "-"}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
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
