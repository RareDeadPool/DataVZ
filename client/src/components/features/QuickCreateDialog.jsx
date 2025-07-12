"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, BarChart3, LineChart, PieChart, ScatterChart, Zap, Brain } from "lucide-react"

const quickOptions = [
  {
    id: "upload-analyze",
    title: "Upload & Auto-Analyze",
    description: "Upload a file and let AI create the best visualizations",
    icon: Brain,
    color: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    recommended: true,
  },
  {
    id: "quick-chart",
    title: "Quick Chart",
    description: "Create a chart from existing data in seconds",
    icon: Zap,
    color: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
  },
  {
    id: "upload-file",
    title: "Upload New File",
    description: "Upload Excel or CSV file to get started",
    icon: Upload,
    color: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
  },
]

const chartTemplates = [
  {
    id: "sales-dashboard",
    title: "Sales Dashboard",
    description: "Revenue, trends, and performance metrics",
    icon: BarChart3,
    charts: ["Bar Chart", "Line Chart", "KPI Cards"],
  },
  {
    id: "trend-analysis",
    title: "Trend Analysis",
    description: "Time-series data visualization",
    icon: LineChart,
    charts: ["Line Chart", "Area Chart"],
  },
  {
    id: "market-share",
    title: "Market Share",
    description: "Proportional data breakdown",
    icon: PieChart,
    charts: ["Pie Chart", "Donut Chart"],
  },
  {
    id: "correlation",
    title: "Correlation Analysis",
    description: "Relationship between variables",
    icon: ScatterChart,
    charts: ["Scatter Plot", "Bubble Chart"],
  },
]

export function QuickCreateDialog({ open, onOpenChange }) {
  const [step, setStep] = useState(1)
  const [selectedOption, setSelectedOption] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId)
    if (optionId === "upload-file") {
      onOpenChange(false)
      resetDialog()
    } else if (optionId === "upload-analyze") {
      onOpenChange(false)
      resetDialog()
    } else {
      setStep(2)
    }
  }

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId)
    onOpenChange(false)
    resetDialog()
  }

  const resetDialog = () => {
    setStep(1)
    setSelectedOption("")
    setSelectedTemplate("")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) resetDialog()
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Create
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Choose how you'd like to create your visualization"
              : "Select a template to get started quickly"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid gap-4">
            {quickOptions.map((option) => {
              const IconComponent = option.icon
              return (
                <Card
                  key={option.id}
                  className="cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50 bg-card dark:bg-zinc-900 text-foreground dark:text-white"
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${option.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground dark:text-white">{option.title}</h3>
                          {option.recommended && (
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <span className="text-sm text-muted-foreground">Choose a template</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {chartTemplates.map((template) => {
                const IconComponent = template.icon
                return (
                  <Card
                    key={template.id}
                    className="cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50 bg-card dark:bg-zinc-900 text-foreground dark:text-white"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{template.title}</CardTitle>
                          <CardDescription className="text-xs">{template.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1">
                        {template.charts.map((chart) => (
                          <Badge key={chart} variant="outline" className="text-xs">
                            {chart}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
