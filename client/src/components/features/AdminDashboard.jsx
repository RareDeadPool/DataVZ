import React, { useEffect, useState } from "react"
import { 
  PanelTopIcon as Panel, 
  Users, 
  FileBarChart, 
  Shield, 
  Check, 
  X, 
  Ban, 
  User as UserIcon, 
  BarChart3, 
  PieChart, 
  BarChart2, 
  AreaChart,
  Filter,
  RefreshCw,
  TrendingUp,
  Activity,
  Database,
  FileText,
  Crown,
  UserCheck,
  UserX,
  Eye,
  Settings
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const chartTypeIcons = {
  bar: BarChart3,
  pie: PieChart,
  area: AreaChart,
  '3d': BarChart2,
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      let url = `${API}/auth/users`;
      const params = [];
      if (roleFilter) params.push(`role=${roleFilter}`);
      if (statusFilter) params.push(`status=${statusFilter}`);
      if (params.length) url += `?${params.join("&")}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch users");
      setUsers(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/projects/analytics/summary`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      setAnalytics(await res.json());
    } catch (err) {
      setAnalyticsError(err.message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter, statusFilter]);
  useEffect(() => { fetchAnalytics(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId + "-role");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/auth/users/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, role: newRole })
      });
      if (!res.ok) throw new Error("Failed to update role");
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    setActionLoading(userId + "-status");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/auth/users/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'default';
      case 'blocked': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return UserCheck;
      case 'blocked': return Ban;
      default: return UserX;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-foreground/5 rounded-xl border">
              <Shield className="h-7 w-7 text-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Comprehensive user management and platform analytics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-12">
        {/* Platform Analytics Overview */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-foreground/5 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Platform Analytics</h2>
          </div>
          
          {analyticsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse border-0 shadow-md">
                  <CardContent className="p-8">
                    <div className="h-20 bg-muted rounded-lg"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : analyticsError ? (
            <Card className="border-0 shadow-md bg-muted/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-foreground">
                  <X className="h-4 w-4" />
                  <span>{analyticsError}</span>
                </div>
              </CardContent>
            </Card>
          ) : analytics ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Users</p>
                        <p className="text-3xl font-bold tracking-tight">{analytics.userCount}</p>
                      </div>
                      <div className="p-4 bg-foreground/5 rounded-2xl">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Projects</p>
                        <p className="text-3xl font-bold tracking-tight">{analytics.projectCount}</p>
                      </div>
                      <div className="p-4 bg-foreground/5 rounded-2xl">
                        <Database className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Excel Files</p>
                        <p className="text-3xl font-bold tracking-tight">{analytics.excelCount}</p>
                      </div>
                      <div className="p-4 bg-foreground/5 rounded-2xl">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Charts Generated</p>
                        <p className="text-3xl font-bold tracking-tight">{analytics.chartCount}</p>
                      </div>
                      <div className="p-4 bg-foreground/5 rounded-2xl">
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-foreground/5 rounded-lg">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-lg">Usage Trends</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.chartUsage && analytics.chartUsage.length > 0 ? (
                      <div className="w-full overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-semibold">Date</TableHead>
                              <TableHead className="text-right font-semibold">Charts Created</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {analytics.chartUsage.map(row => (
                              <TableRow key={row._id} className="hover:bg-muted/30">
                                <TableCell className="font-medium">{row._id}</TableCell>
                                <TableCell className="text-right">
                                  <Badge variant="outline" className="font-mono">{row.count}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto mb-4">
                          <Activity className="h-12 w-12 opacity-40" />
                        </div>
                        <p className="text-lg font-medium">No Recent Activity</p>
                        <p className="text-sm">No charts created in the last 30 days</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-foreground/5 rounded-lg">
                        <PieChart className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-lg">Chart Types</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.popularTypes && analytics.popularTypes.length > 0 ? (
                      <div className="space-y-4">
                        {analytics.popularTypes.map(type => {
                          const Icon = chartTypeIcons[type._id?.toLowerCase()] || BarChart3;
                          return (
                            <div key={type._id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/40 hover:to-muted/20 transition-all duration-200">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-background rounded-xl shadow-sm">
                                  <Icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <span className="font-semibold capitalize text-lg">{type._id || 'Other'}</span>
                              </div>
                              <Badge variant="secondary" className="text-sm px-3 py-1 font-mono">{type.count}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto mb-4">
                          <PieChart className="h-12 w-12 opacity-40" />
                        </div>
                        <p className="text-lg font-medium">No Chart Data</p>
                        <p className="text-sm">No charts have been created yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}
        </section>

        <div className="border-t border-border/50"></div>

        {/* User Management */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-foreground/5 rounded-lg">
              <Users className="h-5 w-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">User Management</h2>
          </div>
          
          {/* Filters */}
          <Card className="mb-6 border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-foreground/5 rounded-lg">
                    <Filter className="h-4 w-4 text-foreground" />
                  </div>
                  <span className="font-semibold">Filters</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">Role:</span>
                  <select 
                    value={roleFilter} 
                    onChange={e => setRoleFilter(e.target.value)} 
                    className="border border-border rounded-lg px-4 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)} 
                    className="border border-border rounded-lg px-4 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                
                <Button 
                  size="sm" 
                  onClick={fetchUsers} 
                  disabled={loading}
                  className="ml-auto px-6"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-destructive/50 mb-6 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <X className="h-4 w-4" />
                  <span className="font-medium">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-foreground/5 rounded-lg">
                  <Eye className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-lg">User Directory</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="font-semibold text-foreground">User</TableHead>
                      <TableHead className="font-semibold text-foreground">Email</TableHead>
                      <TableHead className="font-semibold text-foreground">Role</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-foreground">Joined</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex items-center justify-center gap-3">
                            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                            <span className="text-muted-foreground font-medium">Loading users...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="text-muted-foreground">
                            <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto mb-4">
                              <Users className="h-12 w-12 opacity-40" />
                            </div>
                            <p className="text-lg font-medium">No Users Found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : users.map(user => {
                      const StatusIcon = getStatusIcon(user.status);
                      return (
                        <TableRow key={user._id} className="hover:bg-muted/20 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-muted/50 rounded-full">
                                <UserIcon className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">{user.name}</div>
                                <div className="text-sm text-muted-foreground font-mono">ID: {user._id.slice(-8)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className="px-3 py-1">
                                {user.role === 'admin' && <Crown className="h-3 w-3 mr-2" />}
                                {user.role}
                              </Badge>
                              <div className="flex gap-1">
                                {user.role !== 'admin' && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    disabled={actionLoading === user._id + "-role"} 
                                    onClick={() => handleRoleChange(user._id, 'admin')}
                                    className="h-8 w-8 p-0 hover:bg-muted/50"
                                    title="Promote to Admin"
                                  >
                                    <Shield className="h-4 w-4" />
                                  </Button>
                                )}
                                {user.role === 'admin' && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    disabled={actionLoading === user._id + "-role"} 
                                    onClick={() => handleRoleChange(user._id, 'user')}
                                    className="h-8 w-8 p-0 hover:bg-muted/50"
                                    title="Remove Admin"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <StatusIcon className="h-4 w-4" />
                              <Badge variant={getStatusBadgeVariant(user.status)} className="px-3 py-1">
                                {user.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-end">
                              {user.status !== 'active' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  disabled={actionLoading === user._id + "-status"} 
                                  onClick={() => handleStatusChange(user._id, 'active')}
                                  className="h-8 px-3"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              {user.status !== 'inactive' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  disabled={actionLoading === user._id + "-status"} 
                                  onClick={() => handleStatusChange(user._id, 'inactive')}
                                  className="h-8 px-3"
                                >
                                  <Ban className="h-3 w-3" />
                                </Button>
                              )}
                              {user.status !== 'blocked' && (
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  disabled={actionLoading === user._id + "-status"} 
                                  onClick={() => handleStatusChange(user._id, 'blocked')}
                                  className="h-8 px-3"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                              {user.status === 'blocked' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  disabled={actionLoading === user._id + "-status"} 
                                  onClick={() => handleStatusChange(user._id, 'active')}
                                  className="h-8 px-3"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}