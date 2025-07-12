"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet } from "lucide-react"

export function PreviewSection() {
  return (
    <Card className="mt-6 bg-card dark:bg-zinc-900 text-foreground dark:text-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          <CardTitle>Data Preview</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
          <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Upload an Excel or CSV file to see a preview of your data here.</p>
      </CardContent>
    </Card>
  )
}
