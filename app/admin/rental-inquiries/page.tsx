import { getCurrentUser } from '@/lib/auth';
import { getAllInquiries, getInquiryStats } from '@/lib/rental-inquiries';
import { Role, hasPermission, PERMISSIONS } from '@/lib/rbac';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { redirect } from 'next/navigation';
import { InquiryTable } from '@/components/admin/inquiry-table';

// Force dynamic rendering for this page since it fetches real-time data from Redis
export const dynamic = 'force-dynamic';

export default async function RentalInquiriesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/signin?callbackUrl=/admin/rental-inquiries');
  }

  // Check if user has permission to view inquiries
  if (!hasPermission(currentUser.role as Role, PERMISSIONS.VIEW_PRODUCTS)) {
    redirect('/admin');
  }

  // Fetch all inquiries and stats
  const inquiries = await getAllInquiries();
  const stats = await getInquiryStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Rental Inquiries</h2>
        <p className="text-muted-foreground">
          Manage customer rental inquiries and booking requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All inquiries received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.contacted}</div>
            <p className="text-xs text-muted-foreground">
              Customer contacted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">
              Bookings confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Rentals completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inquiries by Product */}
      {Object.keys(stats.byProduct).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inquiries by Product</CardTitle>
            <CardDescription>
              Popular products with rental inquiries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(stats.byProduct)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([productTitle, count]) => (
                  <div
                    key={productTitle}
                    className="flex flex-col items-center justify-center p-4 border rounded-lg"
                  >
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground text-center line-clamp-2">
                      {productTitle}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inquiries Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Inquiries</CardTitle>
          <CardDescription>
            View and manage all rental inquiries. Use the filters to find specific inquiries.
            {hasPermission(currentUser.role as Role, PERMISSIONS.MANAGE_PRODUCTS) &&
              ' Update status or add notes as needed.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InquiryTable inquiries={inquiries} />
        </CardContent>
      </Card>
    </div>
  );
}
