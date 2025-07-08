"use client"

import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react"

export function Logo({ variant = "default", size = "md" }) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  const iconSize = sizeClasses[size]

  const variants = {
    default: {
      icon: BarChart3,
      bg: "bg-foreground",
      text: "text-background",
    },
    minimal: {
      icon: TrendingUp,
      bg: "bg-primary",
      text: "text-primary-foreground",
    },
    chart: {
      icon: PieChart,
      bg: "bg-blue-600",
      text: "text-white",
    },
    analytics: {
      icon: Activity,
      bg: "bg-green-600",
      text: "text-white",
    },
  }

  const config = variants[variant]
  const IconComponent = config.icon

  return (
    <div
      className={`flex aspect-square items-center justify-center rounded-lg ${config.bg} ${config.text} ${iconSize}`}
    >
      <IconComponent
        className={`${size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-8 w-8"}`}
      />
    </div>
  )
}
