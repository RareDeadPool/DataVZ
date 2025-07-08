"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, FileSpreadsheet, Eye } from "lucide-react"

export function RecentUploads() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Recent Uploads</CardTitle>
          </div>
          <Badge variant="secondary">1</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="p-2 bg-background rounded">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Sample.xlsx</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  9 days ago
                </Badge>
                <Badge variant="outline" className="text-xs">
                  # 10 rows
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="mt-2 h-8 px-2">
                <Eye className="mr-1 h-3 w-3" />
                Preview
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
