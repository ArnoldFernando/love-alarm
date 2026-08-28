"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MatchesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Matches</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Match management interface will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
