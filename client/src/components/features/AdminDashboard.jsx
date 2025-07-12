"use client"

import { PanelTopIcon as Panel, Users, FileBarChart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboard() {
  const stats = [
    {
      label: "Total Users",
      value: "1,248",
      icon: Users,
    },
    {
      label: "Active Projects",
      value: "312",
      icon: FileBarChart,
    },
    {
      label: "System Health",
      value: "✅ All systems operational",
      icon: Panel,
    },
  ]

  return (
    <section className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border p-6 text-sm text-muted-foreground bg-card dark:bg-zinc-900">
        <p>
          This is a placeholder Admin Dashboard. Hook it up to your backend to display real usage metrics, system logs,
          and user management tools.
        </p>
      </div>
    </section>
  )
}
