import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a magic link to sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Your account has been created successfully! We&apos;ve sent a
              magic link to your email address. Click the link in the email to
              complete your sign-in and access the admin dashboard.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Next Steps:</h4>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-medium">1.</span>
                <span>
                  Check your email inbox for a message from Youkhana Admin
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">2.</span>
                <span>Click the magic link in the email</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">3.</span>
                <span>
                  You&apos;ll be automatically signed in and redirected to the
                  admin dashboard
                </span>
              </li>
            </ol>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-900">
              <strong>Note:</strong> If you don&apos;t see the email, check your
              spam folder. The magic link will expire in 24 hours.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/auth/signin" className="w-full">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="ghost" className="w-full">
                Go to Homepage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
