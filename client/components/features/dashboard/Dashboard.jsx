"use client"

import { UploadSection } from "./UploadSection"
import { PreviewSection } from "./PreviewSection"
import { RecentUploads } from "./RecentUploads"

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Manage your Excel uploads and data processing</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <UploadSection />
          <PreviewSection />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RecentUploads />
        </div>
      </div>
    </div>
  )
}
