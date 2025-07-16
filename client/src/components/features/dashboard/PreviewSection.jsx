"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet } from "lucide-react"

export function PreviewSection() {
  return (
    <Card className="mt-4 sm:mt-6 bg-white dark:bg-[#0a0f1a] text-foreground dark:text-white px-2 sm:px-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          <CardTitle>Data Preview</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-white/80 dark:bg-[#0a0f1a]/80 rounded-full flex items-center justify-center mb-4">
          <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Upload an Excel or CSV file to see a preview of your data here.</p>
      </CardContent>
    </Card>
  )
}
