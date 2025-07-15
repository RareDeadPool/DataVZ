"use client"

import datavizLogo from '/dataviz-logo.png'

export function Logo({ variant = "default", size = "md" }) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  const iconSize = sizeClasses[size]

  return (
    <div
      className={`flex aspect-square items-center justify-center rounded-lg bg-white ${iconSize}`}
    >
      <img src={datavizLogo} alt="DataViz Logo" className="object-contain w-3/4 h-3/4" />
    </div>
  )
}
