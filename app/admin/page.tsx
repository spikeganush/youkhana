import { StatsCard } from "@/components/admin/stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Mail,
  Package,
  TrendingUp,
  UserPlus,
  UserMinus,
  UserCog,
  LogIn,
  LogOut,
  Settings,
  PackagePlus,
  PackageMinus,
  Eye,
  EyeOff,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { redis } from "@/lib/redist";
import { getProductCount } from "@/lib/rental-products";
import { getAuditLogs, type AuditLog } from "@/lib/audit-log";
import { formatDistanceToNow } from "date-fns";

// Force dynamic rendering for this page since it fetches real-time data from Redis
export const dynamic = "force-dynamic";

// Helper to get icon for audit log action
function getAuditIcon(action: AuditLog["action"]) {
  const iconMap: Record<AuditLog["action"], React.ElementType> = {
    "user.create": UserPlus,
    "user.update.role": UserCog,
    "user.update.name": UserCog,
    "user.delete": UserMinus,
    "invitation.create": Mail,
    "invitation.resend": Mail,
    "invitation.cancel": Mail,
    "invitation.accept": Mail,
    "auth.signin": LogIn,
    "auth.signout": LogOut,
    "auth.signup": UserPlus,
    "settings.update": Settings,
    "product.create": PackagePlus,
    "product.update": Package,
    "product.delete": PackageMinus,
    "product.status.toggle": Eye,
    "product.featured.toggle": Star,
  };
  return iconMap[action] || Clock;
}

// Helper to get human-readable description for audit log
function getAuditDescription(log: AuditLog): string {
  const actionDescriptions: Record<AuditLog["action"], string> = {
    "user.create": `created user ${log.resource}`,
    "user.update.role": `updated role for ${log.resource}`,
    "user.update.name": `updated name for ${log.resource}`,
    "user.delete": `deleted user ${log.resource}`,
    "invitation.create": `invited ${log.resource}`,
    "invitation.resend": `resent invitation to ${log.resource}`,
    "invitation.cancel": `cancelled invitation for ${log.resource}`,
    "invitation.accept": `accepted invitation`,
    "auth.signin": `signed in`,
    "auth.signout": `signed out`,
    "auth.signup": `signed up`,
    "settings.update": `updated settings`,
    "product.create": `created product`,
    "product.update": `updated product`,
    "product.delete": `deleted product`,
    "product.status.toggle": `toggled status for product`,
    "product.featured.toggle": `toggled featured status`,
  };
  return actionDescriptions[log.action] || log.action;
}

async function getAdminStats() {
  try {
    // Get total users count
    const userEmailsSet = await redis.smembers("users:all");
    const totalUsers = userEmailsSet?.length || 0;

    // Get pending invitations count
    const pendingInvitationsSet = await redis.smembers("invitations:pending");
    const pendingInvitations = pendingInvitationsSet?.length || 0;

    // Get total products count
    const totalProducts = await getProductCount();

    return {
      totalUsers,
      pendingInvitations,
      totalProducts,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      totalUsers: 0,
      pendingInvitations: 0,
      totalProducts: 0,
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  // Fetch recent audit logs (last 10)
  const recentLogs = await getAuditLogs(10);

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
            <CardDescription>Common administrative tasks</CardDescription>
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
            {recentLogs.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No recent activity to display
              </div>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => {
                  const Icon = getAuditIcon(log.action);
                  const StatusIcon =
                    log.result === "success" ? CheckCircle2 : XCircle;
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                    >
                      <div className="mt-0.5">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {log.performedBy}
                          </span>
                          <span className="text-muted-foreground">
                            {getAuditDescription(log)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {formatDistanceToNow(new Date(log.timestamp), {
                              addSuffix: true,
                            })}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{log.category.replace(/_/g, " ")}</span>
                        </div>
                      </div>
                      <div className="mt-0.5">
                        <StatusIcon
                          className={`h-4 w-4 ${
                            log.result === "success"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
