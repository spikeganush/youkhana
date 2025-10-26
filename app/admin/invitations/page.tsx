import { getCurrentUser } from '@/lib/auth';
import { getPendingInvitations } from '@/lib/invitations';
import { Role, hasPermission, PERMISSIONS } from '@/lib/rbac';
import { InviteForm } from '@/components/admin/invite-form';
import { InvitationTable } from '@/components/admin/invitation-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Clock, Users } from 'lucide-react';
import { redirect } from 'next/navigation';

// Force dynamic rendering for this page since it fetches real-time data from Redis
export const dynamic = 'force-dynamic';

export default async function InvitationsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/signin?callbackUrl=/admin/invitations');
  }

  // Check if user has permission to view invitations
  if (!hasPermission(currentUser.role as Role, PERMISSIONS.VIEW_INVITATIONS)) {
    redirect('/admin');
  }

  // Fetch all pending invitations
  const invitations = await getPendingInvitations();

  // Calculate stats
  const totalInvitations = invitations.length;
  const adminInvitations = invitations.filter((i) => i.role === 'ADMIN').length;
  const memberInvitations = invitations.filter((i) => i.role === 'MEMBER').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Invitations</h2>
        <p className="text-muted-foreground">
          Send and manage invitations for new admin users
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvitations}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting acceptance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Invitations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminInvitations}</div>
            <p className="text-xs text-muted-foreground">
              For admin role
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Invitations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberInvitations}</div>
            <p className="text-xs text-muted-foreground">
              For member role
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invite Form and Table in Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Invite Form - Takes 1 column */}
        <div className="md:col-span-1">
          <InviteForm />
        </div>

        {/* Invitations Table - Takes 2 columns */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Manage pending invitations. You can resend or cancel invitations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvitationTable invitations={invitations} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
