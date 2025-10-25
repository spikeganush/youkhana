"use client";

/**
 * Signup Form Component
 *
 * Form for new users to create their account using an invitation token.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Invitation } from "@/lib/invitations";
import { getRoleLabel, getRoleDescription } from "@/lib/rbac";
import { completeSignupAction } from "@/app/auth/signup/actions";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { User, Mail, UserPlus } from "lucide-react";

interface SignupFormProps {
  invitation: Invitation;
}

export function SignupForm({ invitation }: SignupFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.trim().length === 0) {
      toast.error("Please enter your name");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the user account via server action
      const result = await completeSignupAction(
        invitation.email,
        name.trim(),
        invitation.role,
        invitation.createdBy,
        invitation.token
      );

      if (!result.success) {
        toast.error(result.message);
        setIsSubmitting(false);
        return;
      }

      // Auto sign-in the user using magic link
      const signInResult = await signIn("resend", {
        email: invitation.email,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error(
          "Account created but sign-in failed. Please sign in manually."
        );
        router.push("/auth/signin");
        return;
      }

      toast.success(
        "Account created successfully! Check your email to complete sign-in."
      );

      // Redirect to a page informing them to check their email
      router.push("/auth/verify-email");
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create account"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Invitation Info */}
      <div className="space-y-3 rounded-lg bg-muted p-4">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Email:</span>
          <span className="font-medium">{invitation.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Role:</span>
          <Badge variant="secondary">{getRoleLabel(invitation.role)}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {getRoleDescription(invitation.role)}
        </p>
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This will be displayed in the admin dashboard
          </p>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <span className="mr-2">Creating Account...</span>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </>
          )}
        </Button>
      </form>

      {/* Additional Info */}
      <div className="rounded-lg border border-border bg-background p-4">
        <h4 className="mb-2 text-sm font-medium">What happens next?</h4>
        <ol className="space-y-2 text-xs text-muted-foreground">
          <li className="flex gap-2">
            <span className="font-medium">1.</span>
            <span>
              Your account will be created with the role:{" "}
              {getRoleLabel(invitation.role)}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium">2.</span>
            <span>
              You&apos;ll receive a magic link via email to complete sign-in
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium">3.</span>
            <span>
              Click the link in your email to access the admin dashboard
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
