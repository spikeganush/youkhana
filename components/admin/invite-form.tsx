'use client';

/**
 * Invite Form Component
 *
 * Form for sending invitations to new users with role selection.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sendInvitationAction } from '@/app/admin/invitations/actions';
import { ROLES, Role, getRoleLabel, getRoleDescription } from '@/lib/rbac';
import { toast } from 'react-hot-toast';
import { Mail, UserPlus } from 'lucide-react';

export function InviteForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(ROLES.MEMBER);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !role) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await sendInvitationAction(email, role);

      if (result.success) {
        toast.success(result.message);
        // Reset form
        setEmail('');
        setRole(ROLES.MEMBER);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Send Invitation
        </CardTitle>
        <CardDescription>
          Invite a new user to join the admin space
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as Role)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ROLES.ADMIN}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{getRoleLabel(ROLES.ADMIN)}</span>
                    <span className="text-xs text-muted-foreground">
                      Can manage users and invitations
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value={ROLES.MEMBER}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{getRoleLabel(ROLES.MEMBER)}</span>
                    <span className="text-xs text-muted-foreground">
                      Limited view-only access
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {role && (
              <p className="text-sm text-muted-foreground">
                {getRoleDescription(role)}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <span className="mr-2">Sending...</span>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
