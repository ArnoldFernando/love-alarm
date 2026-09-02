"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Mail, Calendar, MapPin, User as UserIcon, Shield, Ban, CheckCircle } from "lucide-react"
import type { User } from "@/types"

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const userId = params.id as string

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}`)
      console.log('User detail response:', res.data)
      return res.data.data
    },
  })

  console.log('User ID:', userId)
  console.log('User Data:', userData)
  console.log('Is Loading:', isLoading)
  console.log('Error:', error)

  const user: User = userData

  const suspendMutation = useMutation({
    mutationFn: () => api.post(`/admin/users/${userId}/suspend`, { reason: "Admin action" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] })
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })

  const banMutation = useMutation({
    mutationFn: () => api.post(`/admin/users/${userId}/ban`, { reason: "Admin action" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] })
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })

  const reactivateMutation = useMutation({
    mutationFn: () => api.post(`/admin/users/${userId}/reactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] })
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-500">Loading user details...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="text-gray-500">User not found</div>
        <Button onClick={() => router.push("/users")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200"
      case "suspended":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "banned":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-purple-50 text-purple-700 border-purple-200",
      moderator: "bg-blue-50 text-blue-700 border-blue-200",
      user: "bg-gray-50 text-gray-700 border-gray-200",
    }
    return colors[role as keyof typeof colors] || colors.user
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/users")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
        <div className="flex gap-2">
          {user.account_status === "active" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => suspendMutation.mutate()}
                disabled={suspendMutation.isPending || user.role === "admin"}
              >
                <Shield className="w-4 h-4 mr-2" />
                Suspend
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => banMutation.mutate()}
                disabled={banMutation.isPending || user.role === "admin"}
              >
                <Ban className="w-4 h-4 mr-2" />
                Ban
              </Button>
            </>
          )}
          {(user.account_status === "suspended" || user.account_status === "banned") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => reactivateMutation.mutate()}
              disabled={reactivateMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Reactivate
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.profile?.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.profile?.display_name || "No name"}
                </h2>
                <p className="text-gray-500">@{user.profile?.username || "no-username"}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <UserIcon className="w-4 h-4" />
                <span className="capitalize">{user.profile?.gender || "Not specified"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Born: {user.profile?.date_of_birth || "Not specified"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>
                  {user.profile?.location_city
                    ? `${user.profile.location_city}, ${user.profile.location_country || ""}`
                    : "Location not set"}
                </span>
              </div>
            </div>

            {user.profile?.bio && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Bio</h3>
                  <p className="text-gray-600 text-sm">{user.profile.bio}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <div className="mt-1">
                <Badge className={`${getStatusColor(user.account_status)} border`}>
                  {user.account_status}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">Role</label>
              <div className="mt-1">
                <Badge className={`${getRoleBadge(user.role)} border capitalize`}>
                  {user.role}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">Email Verified</label>
              <div className="mt-1 text-sm font-medium">
                {user.email_verified_at ? (
                  <span className="text-green-600">✓ Verified</span>
                ) : (
                  <span className="text-gray-400">Not verified</span>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm text-gray-500">Joined</label>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">Last Updated</label>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {new Date(user.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
