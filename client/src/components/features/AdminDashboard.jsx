"use client"

import React, { useEffect, useState } from "react"
import { PanelTopIcon as Panel, Users, FileBarChart, Shield, Check, X, Ban, User as UserIcon, BarChart3, PieChart, BarChart2, AreaChart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

  return (
    <section className="flex flex-col gap-6 p-2 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Admin Panel: User Management</h1>
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <span>Filter:</span>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border rounded px-2 py-1">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-2 py-1">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blocked">Blocked</option>
        </select>
        <Button size="sm" onClick={fetchUsers} disabled={loading}>Refresh</Button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signup Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
                ) : users.length === 0 ? (
                  <TableRow><TableCell colSpan={6}>No users found.</TableCell></TableRow>
                ) : users.map(user => (
                  <TableRow key={user._id}>
                    <TableCell className="flex items-center gap-2"><UserIcon className="h-4 w-4" />{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'secondary' : 'outline'}>{user.role}</Badge>
                      {user.role !== 'admin' && (
                        <Button size="xs" variant="ghost" className="ml-2" disabled={actionLoading === user._id + "-role"} onClick={() => handleRoleChange(user._id, 'admin')}><Shield className="h-4 w-4" /> Make Admin</Button>
                      )}
                      {user.role === 'admin' && (
                        <Button size="xs" variant="ghost" className="ml-2" disabled={actionLoading === user._id + "-role"} onClick={() => handleRoleChange(user._id, 'user')}><X className="h-4 w-4" /> Remove Admin</Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : user.status === 'blocked' ? 'destructive' : 'outline'}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</TableCell>
                    <TableCell className="flex gap-1">
                      {user.status !== 'active' && (
                        <Button size="xs" variant="outline" disabled={actionLoading === user._id + "-status"} onClick={() => handleStatusChange(user._id, 'active')}><Check className="h-4 w-4" /> Activate</Button>
                      )}
                      {user.status !== 'inactive' && (
                        <Button size="xs" variant="outline" disabled={actionLoading === user._id + "-status"} onClick={() => handleStatusChange(user._id, 'inactive')}><Ban className="h-4 w-4" /> Deactivate</Button>
                      )}
                      {user.status !== 'blocked' && (
                        <Button size="xs" variant="destructive" disabled={actionLoading === user._id + "-status"} onClick={() => handleStatusChange(user._id, 'blocked')}><X className="h-4 w-4" /> Block</Button>
                      )}
                      {user.status === 'blocked' && (
                        <Button size="xs" variant="outline" disabled={actionLoading === user._id + "-status"} onClick={() => handleStatusChange(user._id, 'active')}><Check className="h-4 w-4" /> Unblock</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Platform Analytics Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Platform Analytics</h2>
        {analyticsLoading ? (
          <div>Loading analytics...</div>
        ) : analyticsError ? (
          <div className="text-red-500">{analyticsError}</div>
        ) : analytics ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Card><CardHeader><CardTitle>Total Users</CardTitle></CardHeader><CardContent><span className="text-2xl font-bold">{analytics.userCount}</span></CardContent></Card>
              <Card><CardHeader><CardTitle>Total Projects</CardTitle></CardHeader><CardContent><span className="text-2xl font-bold">{analytics.projectCount}</span></CardContent></Card>
              <Card><CardHeader><CardTitle>Excel Files Uploaded</CardTitle></CardHeader><CardContent><span className="text-2xl font-bold">{analytics.excelCount}</span></CardContent></Card>
              <Card><CardHeader><CardTitle>Charts Generated</CardTitle></CardHeader><CardContent><span className="text-2xl font-bold">{analytics.chartCount}</span></CardContent></Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle>Usage Over Time (Last 30 Days)</CardTitle></CardHeader>
                <CardContent>
                  {analytics.chartUsage && analytics.chartUsage.length > 0 ? (
                    <div className="w-full overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Charts Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analytics.chartUsage.map(row => (
                            <TableRow key={row._id}>
                              <TableCell>{row._id}</TableCell>
                              <TableCell>{row.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : <div>No chart activity in the last 30 days.</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Most Popular Chart Types</CardTitle></CardHeader>
                <CardContent>
                  {analytics.popularTypes && analytics.popularTypes.length > 0 ? (
                    <ul className="space-y-2">
                      {analytics.popularTypes.map(type => {
                        const Icon = chartTypeIcons[type._id?.toLowerCase()] || BarChart3;
                        return (
                          <li key={type._id} className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <span className="capitalize font-medium">{type._id || 'Other'}</span>
                            <Badge variant="outline">{type.count}</Badge>
                          </li>
                        );
                      })}
                    </ul>
                  ) : <div>No chart data.</div>}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}
