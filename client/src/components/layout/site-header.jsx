"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ThemeToggle } from "../common/mode-toggle";
import { useEffect, useState } from 'react';
import { Bell } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { getPendingInvitations, respondToInvitation } from '@/services/api';
import { refreshTeams } from '../features/TeamsPage';

export function SiteHeader({ title = "Dashboard" }) {
  const [pendingInvites, setPendingInvites] = useState([]);
  const [showInvites, setShowInvites] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  const handleRespond = async (teamId, status) => {
    const token = localStorage.getItem('token');
    try {
      await respondToInvitation(teamId, status, token);
      setPendingInvites(invites => invites.filter(inv => inv.teamId !== teamId));
      setInviteMsg(`Invitation ${status}`);
      if (status === 'accepted' && typeof refreshTeams === 'function') {
        refreshTeams();
      }
      setTimeout(() => setInviteMsg(''), 2000);
    } catch (err) {
      setInviteMsg('Failed to respond.');
      setTimeout(() => setInviteMsg(''), 2000);
    }
  };

  useEffect(() => {
    const fetchInvites = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const invites = await getPendingInvitations(token);
        setPendingInvites(invites);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchInvites();
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b bg-background">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Button className="gap-2" size="sm">
        <Plus className="h-4 w-4" />
        Quick Create
      </Button>

      <Separator orientation="vertical" className="mx-2 h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" className="text-muted-foreground">
              DataViz Professional Suite
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Notification Bell for Pending Invitations */}
      <div className="ml-auto flex items-center gap-4">
        <div className="relative cursor-pointer" onClick={() => setShowInvites(v => !v)}>
          <Bell className="h-6 w-6" />
          {pendingInvites.length > 0 && (
            <Badge className="absolute -top-2 -right-2" variant="destructive">
              {pendingInvites.length}
            </Badge>
          )}
        </div>
        {showInvites && pendingInvites.length > 0 && (
          <div className="absolute right-8 top-14 z-50 bg-white border rounded shadow-lg p-4 min-w-[260px]">
            <div className="font-semibold mb-2">Pending Team Invitations</div>
            <ul className="space-y-2">
              {pendingInvites.map(invite => (
                <li key={invite.teamId} className="text-sm flex items-center justify-between gap-2">
                  <span className="font-medium">{invite.teamName}</span>
                  <div className="flex gap-1">
                    <Button size="xs" variant="default" onClick={() => handleRespond(invite.teamId, 'accepted')}>Accept</Button>
                    <Button size="xs" variant="outline" onClick={() => handleRespond(invite.teamId, 'rejected')}>Reject</Button>
                  </div>
                </li>
              ))}
            </ul>
            {inviteMsg && <div className="mt-2 text-xs text-green-600">{inviteMsg}</div>}
            <div className="mt-2 text-xs text-muted-foreground">You can also manage invitations on the Team page.</div>
          </div>
        )}
        <ThemeToggle />
      </div>
    </header>
  )
}
