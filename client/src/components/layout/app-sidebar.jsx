"use client"
import {
  BarChart3,
  FileSpreadsheet,
  Home,
  Settings,
  User,

  HelpCircle,
  Search,
  BrainCircuit,
  ChevronDown,
  Zap,
  TrendingUp,
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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
  },
]

const bottomItems = [
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

export function AppSidebar({ onLogout, currentPage = "dashboard", onNavigate, onQuickCreate, ...props }) {
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const handleNavClick = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
    // Also use react-router navigation for main pages
    switch (page) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      case 'projects':
        navigate('/projects');
        break;

      case 'settings':
        navigate('/settings');
        break;
      case 'help':
        navigate('/help');
        break;
      case 'search':
        navigate('/search');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'vizard':
        navigate('/vizard');
        break;
      default:
        break;
    }
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
    <Sidebar collapsible="icon" className="border-r" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <img src="/dataviz-logo.png" alt="DataViz Logo" className="h-8 w-8" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">DataViz</span>
            <span className="truncate text-xs">Professional Suite</span>
          </div>
        </div>

        {/* Quick Create Button */}
        <div className="px-2 pb-2">
          <Button
            className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
            size="sm"
            onClick={onQuickCreate}
          >
            <Zap className="h-4 w-4" />
            <span>Quick Create</span>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>PLATFORM</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={currentPage === item.url}
                    onClick={() => handleNavClick(item.url)}
                    className="w-full"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>TOOLS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={currentPage === item.url} onClick={() => handleNavClick(item.url)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    {user?.avatar && user.avatar !== "" && getAvatarUrl(user.avatar) !== "/placeholder-user.jpg" ? (
                      <AvatarImage src={getAvatarUrl(user.avatar)} alt={user?.name || "User"} />
                    ) : (
                      <AvatarFallback className="rounded-lg bg-blue-600 dark:bg-blue-900 text-white dark:text-blue-200">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name || "User"}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email || "user@email.com"}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleNavClick('profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavClick('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>
                  <span>Logout</span>
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
