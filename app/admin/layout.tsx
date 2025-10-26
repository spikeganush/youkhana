import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminLayoutContent } from '@/components/admin/admin-layout-content';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin?callbackUrl=/admin');
  }

  // Check if user has admin role
  const isAdmin = user.role === 'ADMIN' || user.role === 'MASTER_ADMIN';
  if (!isAdmin) {
    redirect('/');
  }

  return <AdminLayoutContent user={user}>{children}</AdminLayoutContent>;
}
