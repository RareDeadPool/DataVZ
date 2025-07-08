import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import {
  Users,
  UserPlus,
  Settings,
  MoreHorizontal,
  Mail,
  Shield,
  Crown,
  User,
  Clock,
  FileSpreadsheet,
  BarChart3,
  Activity,
} from "lucide-react";

const teamMembers = [
  {
    id: 1,
    name: "Aditya Sawant",
    email: "adityasawant0708@outlook.com",
    role: "Owner",
    status: "online",
    joinDate: "Jan 2024",
    projects: 12,
    lastActive: "Now",
    avatar: "/avatars/01.png",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@company.com",
    role: "Admin",
    status: "online",
    joinDate: "Feb 2024",
    projects: 8,
    lastActive: "2 min ago",
    avatar: null,
  },
  {
    id: 3,
    name: "Mike Chen",
    email: "mike@company.com",
    role: "Editor",
    status: "offline",
    joinDate: "Mar 2024",
    projects: 5,
    lastActive: "1 hour ago",
    avatar: null,
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily@company.com",
    role: "Viewer",
    status: "away",
    joinDate: "Apr 2024",
    projects: 2,
    lastActive: "30 min ago",
    avatar: null,
  },
]

const sharedProjects = [
  {
    id: 1,
    name: "Q4 Sales Analysis",
    owner: "Aditya Sawant",
    collaborators: 3,
    lastModified: "2 hours ago",
    status: "Active",
  },
  {
    id: 2,
    name: "Customer Insights Dashboard",
    owner: "Sarah Johnson",
    collaborators: 2,
    lastModified: "1 day ago",
    status: "Active",
  },
  {
    id: 3,
    name: "Marketing ROI Report",
    owner: "Mike Chen",
    collaborators: 4,
    lastModified: "3 days ago",
    status: "Review",
  },
]

const teamActivity = [
  {
    id: 1,
    user: "Sarah Johnson",
    action: "created a new chart",
    target: "Revenue Trends",
    time: "2 hours ago",
    type: "create",
  },
  {
    id: 2,
    user: "Mike Chen",
    action: "shared project",
    target: "Marketing ROI Report",
    time: "4 hours ago",
    type: "share",
  },
  {
    id: 3,
    user: "Emily Davis",
    action: "commented on",
    target: "Customer Insights Dashboard",
    time: "6 hours ago",
    type: "comment",
  },
  {
    id: 4,
    user: "Aditya Sawant",
    action: "updated permissions for",
    target: "Q4 Sales Analysis",
    time: "1 day ago",
    type: "permission",
  },
]

export default function TeamsPage() {
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("viewer")

  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-600" />
      case "admin":
        return <Shield className="h-4 w-4 text-blue-600" />
      case "editor":
        return <User className="h-4 w-4 text-green-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      default:
        return "bg-gray-400"
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "create":
        return <BarChart3 className="h-4 w-4 text-blue-600" />
      case "share":
        return <Users className="h-4 w-4 text-green-600" />
      case "comment":
        return <Activity className="h-4 w-4 text-purple-600" />
      case "permission":
        return <Shield className="h-4 w-4 text-orange-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">Manage team members, permissions, and collaboration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Team Settings
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="projects">Shared Projects</TabsTrigger>
          <TabsTrigger value="activity">Team Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invite Team Member
              </CardTitle>
              <CardDescription>Add new members to your team and assign roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button>Send Invite</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members ({teamMembers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(member.role)}
                          <span className="capitalize">{member.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.projects}</TableCell>
                      <TableCell className="text-muted-foreground">{member.lastActive}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                            {member.role !== "Owner" && (
                              <DropdownMenuItem className="text-destructive">Remove Member</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shared Projects</CardTitle>
              <CardDescription>Projects accessible by team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sharedProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded">
                        <FileSpreadsheet className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Owner: {project.owner} • {project.collaborators} collaborators
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge variant="outline">{project.status}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{project.lastModified}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Project</DropdownMenuItem>
                          <DropdownMenuItem>Manage Access</DropdownMenuItem>
                          <DropdownMenuItem>Share Link</DropdownMenuItem>
                          <DropdownMenuItem>Export</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Team Activity
              </CardTitle>
              <CardDescription>Track what your team members are working on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="p-2 bg-background rounded">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Team Permissions</CardTitle>
                <CardDescription>Configure default permissions for new members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Role for New Members</label>
                  <Select defaultValue="viewer">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Creation</label>
                  <Select defaultValue="editors">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admins">Admins Only</SelectItem>
                      <SelectItem value="editors">Editors and Above</SelectItem>
                      <SelectItem value="all">All Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
                <CardDescription>Basic information about your team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Team Name</label>
                  <Input defaultValue="DataViz Team" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input defaultValue="Professional data visualization team" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Team Size Limit</label>
                  <Select defaultValue="10">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Members</SelectItem>
                      <SelectItem value="10">10 Members</SelectItem>
                      <SelectItem value="25">25 Members</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Update Team Info</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
