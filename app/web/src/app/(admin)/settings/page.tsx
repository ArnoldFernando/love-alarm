"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            System configuration will be managed here. This includes alarm radius defaults,
            cooldown periods, and notification settings.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
