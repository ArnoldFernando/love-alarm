"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: reportsRes, isLoading } = useQuery({
    queryKey: ["admin-reports", statusFilter, page],
    queryFn: async () => {
      const params: any = { page }
      if (statusFilter) params.status = statusFilter
      const res = await api.get("/admin/reports", { params })
      return res.data.data
    },
  })

  const assignMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/reports/${id}/assign`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] })
      toast({ title: "Success", description: "Report assigned for review" })
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to assign report", variant: "destructive" })
    }
  })

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/reports/${id}/resolve`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] })
      toast({ title: "Success", description: "Report resolved" })
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to resolve report", variant: "destructive" })
    }
  })

  const dismissMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/reports/${id}/dismiss`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] })
      toast({ title: "Success", description: "Report dismissed" })
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to dismiss report", variant: "destructive" })
    }
  })

  const reports = reportsRes?.data ?? []
  const pagination = reportsRes?.pagination

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "under_review":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "dismissed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reports</h1>

      <div className="flex gap-2">
        {["", "pending", "under_review", "resolved", "dismissed"].map((s) => (
          <Button
            key={s || "all"}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setStatusFilter(s)
              setPage(1)
            }}
          >
            {s ? s.replace("_", " ") : "All"}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reported Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : reports.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              No reports found for this filter.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Reporter</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Reported User</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Reason</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Status</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-500">Date</th>
                      <th className="py-3 px-4 text-right font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report: any) => (
                      <tr key={report.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {report.reporter?.display_name || "-"}
                          </div>
                          <div className="text-gray-500 text-xs">
                            @{report.reporter?.username || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {report.reported_user?.display_name || "-"}
                          </div>
                          <div className="text-gray-500 text-xs">
                            @{report.reported_user?.username || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4 capitalize text-gray-700">
                          {report.reason.replace("_", " ")}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(report.status)}>
                            {report.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(report.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                          {report.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => assignMutation.mutate(report.id)}
                            >
                              Assign
                            </Button>
                          )}
                          {report.status === "under_review" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => resolveMutation.mutate(report.id)}
                            >
                              Resolve
                            </Button>
                          )}
                          {(report.status === "pending" || report.status === "under_review") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => dismissMutation.mutate(report.id)}
                            >
                              Dismiss
                            </Button>
                          )}
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
