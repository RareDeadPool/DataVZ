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

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

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

  // Fetch teams on mount
  useEffect(() => {
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
    fetchTeams();
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
          <div className="flex gap-2">
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
        </div>
      </div>
      {inviteError && <div className="text-red-500">{inviteError}</div>}
      {inviteSuccess && <div className="text-green-600">{inviteSuccess}</div>}
      <div className="flex gap-4">
        <div className="w-64">
          <Card>
            <CardHeader>
              <CardTitle>Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {teams.map(team => (
                  <li key={team._id}>
                    <Button
                      variant={selectedTeam?._id === team._id ? 'default' : 'ghost'}
                      className="w-full mb-2"
                      onClick={() => handleSelectTeam(team)}
                    >
                      {team.name}
                    </Button>
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
                        <TableCell>{getRoleIcon(member.role)} {member.role}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
