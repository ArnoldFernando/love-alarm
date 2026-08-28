"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AlarmsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Alarms</h1>

      <Card>
        <CardHeader>
          <CardTitle>Alarm Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Alarm event monitoring will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
