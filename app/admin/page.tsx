import { StatsCard } from '@/components/admin/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, Package, TrendingUp } from 'lucide-react';
import { redis } from '@/lib/redist';
import { getProductCount } from '@/lib/rental-products';

// Force dynamic rendering for this page since it fetches real-time data from Redis
export const dynamic = 'force-dynamic';

async function getAdminStats() {
  try {
    // Get total users count
    const userEmailsSet = await redis.smembers('users:all');
    const totalUsers = userEmailsSet?.length || 0;

    // Get pending invitations count
    const pendingInvitationsSet = await redis.smembers('invitations:pending');
    const pendingInvitations = pendingInvitationsSet?.length || 0;

    // Get total products count
    const totalProducts = await getProductCount();

    return {
      totalUsers,
      pendingInvitations,
      totalProducts,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalUsers: 0,
      pendingInvitations: 0,
      totalProducts: 0,
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to the Youkhana admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          description="Active admin users"
          icon={Users}
        />
        <StatsCard
          title="Pending Invitations"
          value={stats.pendingInvitations}
          description="Awaiting acceptance"
          icon={Mail}
        />
        <StatsCard
          title="Products"
          value={stats.totalProducts}
          description="Total rental products"
          icon={Package}
        />
        <StatsCard
          title="Performance"
          value="100%"
          description="System uptime"
          icon={TrendingUp}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/invitations"
              className="block rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <div className="font-medium">Invite New User</div>
              <div className="text-sm text-muted-foreground">
                Send an invitation to a new admin or member
              </div>
            </a>
            <a
              href="/admin/users"
              className="block rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <div className="font-medium">Manage Users</div>
              <div className="text-sm text-muted-foreground">
                View and manage existing users
              </div>
            </a>
            <a
              href="/admin/products"
              className="block rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <div className="font-medium">Manage Products</div>
              <div className="text-sm text-muted-foreground">
                Add and manage rental products
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              No recent activity to display
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Set up your admin space
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              1
            </div>
            <div>
              <div className="font-medium">Invite your first user</div>
              <div className="text-sm text-muted-foreground">
                Go to the Invitations page to send your first invitation
              </div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              2
            </div>
            <div>
              <div className="font-medium">Manage user roles</div>
              <div className="text-sm text-muted-foreground">
                Assign appropriate roles (Admin or Member) to your users
              </div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              3
            </div>
            <div>
              <div className="font-medium">Configure settings</div>
              <div className="text-sm text-muted-foreground">
                Customize your admin space in the Settings page
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
