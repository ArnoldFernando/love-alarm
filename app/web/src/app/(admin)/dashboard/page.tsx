"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/admin/StatCard"
import {
  Users,
  UserCheck,
  Heart,
  AlertTriangle,
  Activity,
  Bell,
} from "lucide-react"

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await api.get("/admin/dashboard")
      return res.data.data
    },
  })

  const cards = [
    {
      title: "Total Users",
      value: stats?.users?.total ?? "-",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Users",
      value: stats?.users?.active ?? "-",
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "New Users Today",
      value: stats?.users?.new_today ?? "-",
      icon: Activity,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Total Matches",
      value: stats?.matches?.total ?? "-",
      icon: Heart,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Total Alarms",
      value: stats?.alarms?.total ?? "-",
      icon: Bell,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Pending Reports",
      value: stats?.reports?.pending ?? "-",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            bg={card.bg}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Suspended Users</span>
              <span className="font-medium">{stats?.users?.suspended ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Banned Users</span>
              <span className="font-medium">{stats?.users?.banned ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Online Users (5 min)</span>
              <span className="font-medium">{stats?.online_users ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Matches Today</span>
              <span className="font-medium">{stats?.matches?.today ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Alarms Today</span>
              <span className="font-medium">{stats?.alarms?.today ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Reports</span>
              <span className="font-medium">{stats?.reports?.total ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pending</span>
              <span className="font-medium text-orange-600">{stats?.reports?.pending ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Under Review</span>
              <span className="font-medium text-blue-600">{stats?.reports?.under_review ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Resolved</span>
              <span className="font-medium text-green-600">{stats?.reports?.resolved ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
