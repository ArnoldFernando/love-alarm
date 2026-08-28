"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d")

  const { data: analytics } = useQuery({
    queryKey: ["admin-analytics", period],
    queryFn: async () => {
      const res = await api.get("/admin/analytics", { params: { period } })
      return res.data.data
    },
  })

  const formatChartData = (data: any[]) => {
    if (!data) return []
    return data.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count: item.count,
    }))
  }

  const chartSections = [
    {
      title: "User Growth",
      data: formatChartData(analytics?.user_growth),
      color: "#2563eb",
    },
    {
      title: "Daily Active Users",
      data: formatChartData(analytics?.daily_active_users),
      color: "#16a34a",
    },
    {
      title: "Matches Per Day",
      data: formatChartData(analytics?.matches_per_day),
      color: "#e11d48",
    },
    {
      title: "Alarms Per Day",
      data: formatChartData(analytics?.alarms_per_day),
      color: "#ea580c",
    },
    {
      title: "Reports Per Day",
      data: formatChartData(analytics?.reports_per_day),
      color: "#9333ea",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              Last {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {chartSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {section.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={section.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={section.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  No data available for this period
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
