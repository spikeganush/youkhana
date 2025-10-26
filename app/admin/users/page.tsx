import { getCurrentUser } from '@/lib/auth';
import { getAllUsers } from '@/lib/redis-auth';
import { Role, hasPermission, PERMISSIONS } from '@/lib/rbac';
import { UserTable } from '@/components/admin/user-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { redirect } from 'next/navigation';

// Force dynamic rendering for this page since it fetches real-time data from Redis
export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/signin?callbackUrl=/admin/users');
  }

  // Check if user has permission to view users
  if (!hasPermission(currentUser.role as Role, PERMISSIONS.VIEW_USERS)) {
    redirect('/admin');
  }

  // Fetch all users
  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage admin users, roles, and permissions
        </p>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Active admin users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === 'ADMIN' || u.role === 'MASTER_ADMIN').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Users with admin privileges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === 'MEMBER').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Regular members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View and manage all admin users. Click the edit icon to change user details or
            roles. Click the delete icon to remove a user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable
            users={users}
            currentUserRole={currentUser.role as Role}
            currentUserEmail={currentUser.email!}
          />
        </CardContent>
      </Card>
    </div>
  );
}
