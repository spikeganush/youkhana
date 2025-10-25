import { validateInvitationToken } from '@/lib/invitations';
import { SignupForm } from '@/components/auth/signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface SignupPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function SignupPage({ params }: SignupPageProps) {
  const { token } = await params;

  // Check if user is already signed in
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect('/admin');
  }

  // Validate the invitation token
  const invitation = await validateInvitationToken(token);

  // Token is invalid or expired
  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                This could happen if:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• The invitation has expired (invitations are valid for 7 days)</li>
                <li>• The invitation has already been used</li>
                <li>• The invitation has been cancelled</li>
                <li>• An account with this email already exists</li>
              </ul>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Please contact your administrator to request a new invitation.
              </p>
              <Link
                href="/auth/signin"
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                Go to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Token is valid - show signup form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>
            You've been invited to join Youkhana Admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm invitation={invitation} />
        </CardContent>
        <div className="border-t px-6 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
