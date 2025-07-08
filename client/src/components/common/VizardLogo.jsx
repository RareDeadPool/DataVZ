"use client"

import { Sparkles } from "lucide-react"

export function VizardLogo({ size = "md" }) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  const iconSize = sizeClasses[size]

  return (
    <div
      className={`flex aspect-square items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white ${iconSize}`}
    >
      <Sparkles
        className={`${size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-8 w-8"}`}
      />
    </div>
  )
}
