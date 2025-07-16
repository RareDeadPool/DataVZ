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
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">User management and platform analytics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-8">
        {/* Platform Analytics Overview */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Platform Analytics</h2>
          </div>
          
          {analyticsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-16 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : analyticsError ? (
            <Card className="border-destructive/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-destructive">
                  <X className="h-4 w-4" />
                  <span>{analyticsError}</span>
                </div>
              </CardContent>
            </Card>
          ) : analytics ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold">{analytics.userCount}</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Projects</p>
                        <p className="text-2xl font-bold">{analytics.projectCount}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Database className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Excel Files</p>
                        <p className="text-2xl font-bold">{analytics.excelCount}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <FileText className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Charts Generated</p>
                        <p className="text-2xl font-bold">{analytics.chartCount}</p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <BarChart3 className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Usage Over Time (Last 30 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.chartUsage && analytics.chartUsage.length > 0 ? (
                      <div className="w-full overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Charts Created</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {analytics.chartUsage.map(row => (
                              <TableRow key={row._id}>
                                <TableCell className="font-medium">{row._id}</TableCell>
                                <TableCell className="text-right">
                                  <Badge variant="outline">{row.count}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No chart activity in the last 30 days</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Popular Chart Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.popularTypes && analytics.popularTypes.length > 0 ? (
                      <div className="space-y-3">
                        {analytics.popularTypes.map(type => {
                          const Icon = chartTypeIcons[type._id?.toLowerCase()] || BarChart3;
                          return (
                            <div key={type._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-background rounded">
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <span className="font-medium capitalize">{type._id || 'Other'}</span>
                              </div>
                              <Badge variant="secondary">{type.count}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No chart data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}
        </section>

        <Separator />

        {/* User Management */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">User Management</h2>
          </div>
          
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Role:</span>
                  <select 
                    value={roleFilter} 
                    onChange={e => setRoleFilter(e.target.value)} 
                    className="border rounded-md px-3 py-1 text-sm bg-background"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)} 
                    className="border rounded-md px-3 py-1 text-sm bg-background"
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
                  className="ml-auto"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-destructive/50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <X className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                All Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Loading users...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No users found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : users.map(user => {
                      const StatusIcon = getStatusIcon(user.status);
                      return (
                        <TableRow key={user._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-muted rounded-full">
                                <UserIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">ID: {user._id.slice(-8)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{user.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                                {user.role === 'admin' && <Crown className="h-3 w-3 mr-1" />}
                                {user.role}
                              </Badge>
                              <div className="flex gap-1">
                                {user.role !== 'admin' && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    disabled={actionLoading === user._id + "-role"} 
                                    onClick={() => handleRoleChange(user._id, 'admin')}
                                    className="h-8 px-2"
                                  >
                                    <Shield className="h-3 w-3" />
                                  </Button>
                                )}
                                {user.role === 'admin' && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    disabled={actionLoading === user._id + "-role"} 
                                    onClick={() => handleRoleChange(user._id, 'user')}
                                    className="h-8 px-2"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon className="h-4 w-4" />
                              <Badge variant={getStatusBadgeVariant(user.status)}>
                                {user.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 justify-end">
                              {user.status !== 'active' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  disabled={actionLoading === user._id + "-status"} 
                                  onClick={() => handleStatusChange(user._id, 'active')}
                                  className="h-8"
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
                                  className="h-8"
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
                                  className="h-8"
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
                                  className="h-8"
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