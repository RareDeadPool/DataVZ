import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash, UserMinus, Shield } from 'lucide-react';
import {
  Users,
  UserPlus,
  Settings,
  Mail,
  Crown,
  User,
  Clock,
  FileSpreadsheet,
  BarChart3,
  Activity,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useSelector } from 'react-redux';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// Fetch teams on mount and expose refresh function
export let refreshTeams = null;

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTeamName, setEditTeamName] = useState('');
  const [deletingTeam, setDeletingTeam] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);
  const [changingRole, setChangingRole] = useState(null);
  const [newRole, setNewRole] = useState('member');
  const user = useSelector(state => state.auth.user);
  const userId = user?.id || user?._id;
  const myMember = selectedTeam?.members?.find(m => m.userId?._id === userId || m.userId === userId);
  const canEditTeam = myMember && (myMember.role === 'owner' || myMember.role === 'admin');
  const canDeleteTeam = myMember && myMember.role === 'owner';

  // Fetch teams function
  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/teams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTeams(data);
      if (data.length > 0) {
        setSelectedTeam(data[0]);
        setMembers(data[0].members || []);
      }
    } catch (err) {
      // handle error
    }
  };

  useEffect(() => {
    fetchTeams();
    refreshTeams = fetchTeams;
  }, []);

  // Change selected team
  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    setMembers(team.members || []);
    setInviteSuccess("");
    setInviteError("");
  };

  // Invite member
  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviteLoading(true);
    setInviteError("");
    setInviteSuccess("");
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/teams/${selectedTeam._id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invite');
      setInviteSuccess('Invitation sent!');
      setInviteEmail("");
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  // Create a new team
  const handleCreateTeam = async () => {
    if (!newTeamName) return;
    setCreateLoading(true);
    setCreateError("");
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newTeamName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create team');
      setTeams(prev => [...prev, data]);
      setSelectedTeam(data);
      setMembers(data.members || []);
      setCreatingTeam(false);
      setNewTeamName("");
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  // Edit team name
  const handleEditTeam = async () => {
    if (!editTeamName) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/teams/${selectedTeam._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: editTeamName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update team');
      setTeams(teams.map(t => t._id === data._id ? data : t));
      setSelectedTeam(data);
      setShowEditModal(false);
    } catch (err) {
      alert(err.message);
    }
  };
  // Delete team
  const handleDeleteTeam = async () => {
    try {
      setDeletingTeam(false);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/teams/${selectedTeam._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete team');
      setTeams(teams.filter(t => t._id !== selectedTeam._id));
      setSelectedTeam(teams.length > 1 ? teams.find(t => t._id !== selectedTeam._id) : null);
    } catch (err) {
      alert(err.message);
    }
  };
  // Remove member
  const handleRemoveMember = async (memberId) => {
    try {
      setRemovingMember(null);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/teams/${selectedTeam._id}/remove-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: memberId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove member');
      setTeams(teams.map(t => t._id === data.team._id ? data.team : t));
      setSelectedTeam(data.team);
      setMembers(data.team.members || []);
    } catch (err) {
      alert(err.message);
    }
  };
  // Change role
  const handleChangeRole = async () => {
    try {
      setChangingRole(null);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/teams/${selectedTeam._id}/change-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: changingRole, role: newRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change role');
      setTeams(teams.map(t => t._id === data.team._id ? data.team : t));
      setSelectedTeam(data.team);
      setMembers(data.team.members || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
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

  // In the return, before rendering teams UI, check if teams.length === 0
  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h2 className="text-2xl font-bold mb-4">You don't have any teams yet</h2>
        {!creatingTeam ? (
          <Button onClick={() => setCreatingTeam(true)} className="mb-4">Create New Team</Button>
        ) : (
          <div className="flex flex-col items-center gap-2 mb-4">
            <Input
              placeholder="Enter team name"
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
              className="w-64"
              disabled={createLoading}
            />
            <Button onClick={handleCreateTeam} disabled={createLoading || !newTeamName}>
              {createLoading ? 'Creating...' : 'Create Team'}
            </Button>
            {createError && <div className="text-red-500">{createError}</div>}
          </div>
        )}
      </div>
    );
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
        </div>
      </div>
      <div className="flex gap-4">
        <div className="w-64">
          <Card>
            <CardHeader className="flex flex-col gap-2">
              <CardTitle>Teams</CardTitle>
              <Button size="sm" variant="default" onClick={() => setShowCreateModal(true)}>
                + Create New Team
              </Button>
            </CardHeader>
            <CardContent>
              <ul>
                {teams.map(team => (
                  <li key={team._id} className="flex items-center justify-between mb-2">
                    <Button
                      variant={selectedTeam?._id === team._id ? 'default' : 'ghost'}
                      className="w-full"
                      onClick={() => handleSelectTeam(team)}
                    >
                      {team.name}
                    </Button>
                    {(canEditTeam || canDeleteTeam) && selectedTeam?._id === team._id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {canEditTeam && <DropdownMenuItem onClick={() => { setEditTeamName(team.name); setShowEditModal(true); }}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>}
                          {canDeleteTeam && <DropdownMenuItem onClick={() => setDeletingTeam(true)}><Trash className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Invite by email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-48"
                  disabled={inviteLoading}
                />
                <Button onClick={handleInvite} disabled={inviteLoading || !inviteEmail}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {inviteLoading ? 'Inviting...' : 'Invite Member'}
                </Button>
              </div>
              {inviteError && <div className="text-red-500 mt-2">{inviteError}</div>}
              {inviteSuccess && <div className="text-green-600 mt-2">{inviteSuccess}</div>}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member, idx) => {
                    const user = member.userId;
                    const isMe = user?._id === userId || user === userId;
                    const canManage = myMember && (myMember.role === 'owner' || myMember.role === 'admin');
                    const canRemove = canManage && (!isMe && (member.role !== 'owner' || myMember.role === 'owner'));
                    const canChangeRole = canManage && (member.role !== 'owner' || myMember.role === 'owner');
                    return (
                      <TableRow key={user?._id || member.userId || idx}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{user?.name ? user.name[0] : '?'}</AvatarFallback>
                            </Avatar>
                            <span>{user?.name || user?._id || member.userId}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user?.email || ''}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          {getRoleIcon(member.role)} {member.role}
                          {(canRemove || canChangeRole) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {canRemove && <DropdownMenuItem onClick={() => setRemovingMember(user?._id || user)}><UserMinus className="mr-2 h-4 w-4" />Remove</DropdownMenuItem>}
                                {canChangeRole && <DropdownMenuItem onClick={() => { setChangingRole(user?._id || user); setNewRole(member.role); }}><Shield className="mr-2 h-4 w-4" />Change Role</DropdownMenuItem>}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Create Team Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Enter team name"
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
              className="w-64"
              disabled={createLoading}
            />
            <Button onClick={handleCreateTeam} disabled={createLoading || !newTeamName}>
              {createLoading ? 'Creating...' : 'Create Team'}
            </Button>
            {createError && <div className="text-red-500">{createError}</div>}
          </div>
        </DialogContent>
      </Dialog>
      {/* Edit Team Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Name</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Team name"
              value={editTeamName}
              onChange={e => setEditTeamName(e.target.value)}
            />
            <Button onClick={handleEditTeam} disabled={!editTeamName}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Delete Team Confirm */}
      <Dialog open={deletingTeam} onOpenChange={setDeletingTeam}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this team? This action cannot be undone.</div>
          <Button variant="destructive" onClick={handleDeleteTeam}>Delete</Button>
        </DialogContent>
      </Dialog>
      {/* Remove Member Confirm */}
      <Dialog open={!!removingMember} onOpenChange={() => setRemovingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to remove this member from the team?</div>
          <Button variant="destructive" onClick={() => handleRemoveMember(removingMember)}>Remove</Button>
        </DialogContent>
      </Dialog>
      {/* Change Role Modal */}
      <Dialog open={!!changingRole} onOpenChange={() => setChangingRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <select value={newRole} onChange={e => setNewRole(e.target.value)} className="border rounded p-2">
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="editor">Editor</option>
            </select>
            <Button onClick={handleChangeRole}>Change Role</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
