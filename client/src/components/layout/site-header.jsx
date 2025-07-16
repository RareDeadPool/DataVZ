import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Plus, Sparkles } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ThemeToggle } from "../common/mode-toggle";
import { cn } from "@/lib/utils"

export function SiteHeader({ 
  title = "Dashboard", 
  onQuickCreate,
  className,
  onOpenMobileSidebar
}) {
  return (
    <header className={cn(
      "flex h-16 shrink-0 items-center gap-4 px-3 sm:px-6 border-b border-border bg-[#0a0f1a] theme-transition",
      "shadow-elegant supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur",
      className
    )}>
      {/* Sidebar trigger and separator */}
      <div className="flex items-center gap-3">
        <button className="md:hidden h-8 w-8 flex items-center justify-center rounded hover:bg-accent hover:text-accent-foreground transition-colors duration-200 focus-ring" onClick={onOpenMobileSidebar}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <SidebarTrigger className="hidden md:inline-flex h-8 w-8 hover:bg-accent hover:text-accent-foreground transition-colors duration-200 focus-ring" />
        <Separator orientation="vertical" className="h-6 bg-border" />
      </div>

      {/* Quick Create Button */}
      <Button 
        onClick={onQuickCreate}
        className={cn(
          "gap-2 h-9 px-3 sm:px-4 font-medium shadow-sm",
          "bg-primary hover:bg-primary-hover text-primary-foreground",
          "hover:shadow-md transition-all duration-200 hover-lift focus-ring"
        )}
        size="sm"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden xs:inline">Quick Create</span>
      </Button>

      <Separator orientation="vertical" className="h-6 bg-border hidden xs:block" />

      {/* Breadcrumb Navigation */}
      <Breadcrumb className="flex-1 hidden sm:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink 
              href="#" 
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
            >
              DataViz Professional Suite
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-muted-foreground" />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-foreground flex items-center gap-2">
              {title === "Ask Vizard" && <Sparkles className="h-4 w-4 text-primary" />}
              {title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}