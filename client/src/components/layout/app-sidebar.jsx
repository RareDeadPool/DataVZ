import {
  BarChart3,
  FileSpreadsheet,
  Home,
  Settings,
  User,
  HelpCircle,
  Search,
  BrainCircuit,
  Zap,
  TrendingUp,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useSelector } from 'react-redux';
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: Home,
  },
  {
    title: "Analytics",
    url: "analytics",
    icon: TrendingUp,
  },
  {
    title: "Projects",
    url: "projects",
    icon: FileSpreadsheet,
  },
  {
    title: "Ask Vizard",
    url: "vizard",
    icon: BrainCircuit,
    badge: "AI",
  },
]

const toolItems = [
  {
    title: "Search",
    url: "search",
    icon: Search,
  },
  {
    title: "Get Help",
    url: "help",
    icon: HelpCircle,
  },
]

export function AppSidebar({ 
  onLogout, 
  currentPage = "dashboard", 
  onNavigate, 
  onQuickCreate,
  className,
  mobileOpen,
  onCloseMobile,
  ...props 
}) {
  const user = useSelector((state) => state.auth.user);

  const handleNavClick = (page) => {
    onNavigate(page);
    if (onCloseMobile) onCloseMobile(); // Close sidebar on mobile nav
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return "/placeholder-user.jpg";
    if (avatar.startsWith("http")) return avatar;
    return `http://localhost:5000${avatar}`;
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className={cn("border-r border-sidebar-border theme-transition bg-white dark:bg-neutral-900",
        "group-data-[collapsible=icon]:bg-white/80 group-data-[collapsible=icon]:dark:bg-zinc-800 group-data-[collapsible=icon]:shadow-none group-data-[collapsible=icon]:border-r group-data-[collapsible=icon]:border-zinc-200 group-data-[collapsible=icon]:p-0",
        className)} 
      {...props}
      style={mobileOpen ? { boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' } : {}}
    >
      <SidebarHeader className={cn(
        "border-b border-sidebar-border bg-white dark:bg-neutral-900 theme-transition p-4",
        "group-data-[collapsible=icon]:bg-white/80 group-data-[collapsible=icon]:dark:bg-zinc-800 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center"
      )}>
        <div className={cn(
          "flex items-center gap-3 animate-fade-in",
          "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
        )}>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl shadow-sm overflow-hidden",
            "group-data-[collapsible=icon]:shadow-none group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
          )}>
            <img src="/dataviz-logo.png" alt="DataViz" className="h-8 w-8 object-contain group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" />
          </div>
          <div className={cn(
            "grid flex-1 text-left text-sm leading-tight",
            "group-data-[collapsible=icon]:hidden"
          )}>
            <span className="truncate font-bold text-sidebar-foreground dark:text-white">DataViz</span>
            <span className="truncate text-xs text-muted-foreground dark:text-zinc-300">Professional Suite</span>
          </div>
        </div>
        <div className={cn("mt-4", "group-data-[collapsible=icon]:hidden")}> {/* Hide Quick Create button when collapsed */}
          <Button
            className={cn(
              "w-full justify-start gap-3 h-10 font-medium shadow-sm",
              "bg-primary hover:bg-primary-hover text-primary-foreground",
              "hover:shadow-md transition-all duration-200 hover-lift"
            )}
            onClick={onQuickCreate}
          >
            <Zap className="h-4 w-4" />
            <span>Quick Create</span>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className={cn(
        "bg-white dark:bg-neutral-900 theme-transition",
        "group-data-[collapsible=icon]:bg-white/80 group-data-[collapsible=icon]:dark:bg-zinc-800 group-data-[collapsible=icon]:p-0"
      )}>
        <SidebarGroup className={cn("animate-slide-in-right", "group-data-[collapsible=icon]:p-0")}> 
          <SidebarGroupLabel className={cn(
            "text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2",
            "group-data-[collapsible=icon]:hidden"
          )}>
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item, index) => (
                <SidebarMenuItem key={item.title} className={cn("animate-fade-in", "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0")}
                  style={{animationDelay: `${index * 50}ms`}}>
                  <SidebarMenuButton
                    isActive={currentPage === item.url}
                    onClick={() => handleNavClick(item.url)}
                    className={cn(
                      "sidebar-item focus-ring",
                      currentPage === item.url 
                        ? "sidebar-item-active shadow-sm" 
                        : "sidebar-item-inactive",
                      "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none"
                    )}
                    tooltip={item.title}
                  >
                    <item.icon className="h-5 w-5 group-data-[collapsible=icon]:mx-auto" />
                    <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground group-data-[collapsible=icon]:hidden">
                        {item.badge}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className={cn("animate-slide-in-right", "group-data-[collapsible=icon]:p-0")} style={{animationDelay: '200ms'}}>
          <SidebarGroupLabel className={cn(
            "text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2",
            "group-data-[collapsible=icon]:hidden"
          )}>
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item, index) => (
                <SidebarMenuItem key={item.title} className={cn("animate-fade-in", "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0")}
                  style={{animationDelay: `${(index + 4) * 50}ms`}}>
                  <SidebarMenuButton 
                    isActive={currentPage === item.url} 
                    onClick={() => handleNavClick(item.url)}
                    className={cn(
                      "sidebar-item focus-ring",
                      currentPage === item.url 
                        ? "sidebar-item-active shadow-sm" 
                        : "sidebar-item-inactive",
                      "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none"
                    )}
                    tooltip={item.title}
                  >
                    <item.icon className="h-5 w-5 group-data-[collapsible=icon]:mx-auto" />
                    <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={cn(
        "border-t border-sidebar-border bg-zinc-200 dark:bg-zinc-900 theme-transition p-3",
        "group-data-[collapsible=icon]:hidden"
      )}>
        <SidebarMenu>
          <SidebarMenuItem className="animate-fade-in" style={{animationDelay: '400ms'}}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className={cn(
                    "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                    "hover:bg-sidebar-accent/50 transition-all duration-200 focus-ring",
                    "h-12 px-3 rounded-lg"
                  )}
                >
                  <Avatar className="h-8 w-8 rounded-lg shadow-sm">
                    {user?.avatar && user.avatar !== "" && getAvatarUrl(user.avatar) !== "/placeholder-user.jpg" ? (
                      <AvatarImage src={getAvatarUrl(user.avatar)} alt={user?.name || "User"} />
                    ) : (
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-semibold">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-sidebar-foreground">
                      {user?.name || "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email || "user@email.com"}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 animate-scale-in bg-popover border-border shadow-elegant-md"
              >
                <DropdownMenuItem 
                  onClick={() => handleNavClick('profile')}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                >
                  <User className="mr-3 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleNavClick('settings')}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                >
                  <Settings className="mr-3 h-4 w-4" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem 
                  onClick={onLogout}
                  className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}