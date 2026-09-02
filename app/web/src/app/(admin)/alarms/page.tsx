"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell } from "lucide-react"
import type { Alarm } from "@/types"

export default function AlarmsPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { data: alarmsRes, isLoading } = useQuery({
    queryKey: ["admin-alarms", search, page],
    queryFn: async () => {
      const res = await api.get("/admin/alarms", {
        params: { search, page },
      })
      return res.data.data
    },
  })

  const alarms: Alarm[] = alarmsRes?.data ?? []
  const pagination = alarmsRes?.pagination

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Alarms</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Bell className="w-4 h-4 text-orange-500" />
          <span>{pagination?.total ?? 0} total alarms</span>
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
          <CardTitle>Alarm Events</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : alarms.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No alarms found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Sender</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Recipient</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Distance (m)</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Triggered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alarms.map((alarm) => (
                      <tr key={alarm.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {alarm.sender?.profile?.display_name || "-"}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {alarm.sender?.email}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {alarm.recipient?.profile?.display_name || "-"}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {alarm.recipient?.email}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                            {alarm.distance_meters !== undefined
                              ? `${Math.round(alarm.distance_meters)}m`
                              : "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(alarm.triggered_at).toLocaleString()}
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
