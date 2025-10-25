'use client';

import { useState } from 'react';
import { User } from '@/lib/redis-auth';
import { ROLES, Role, getRoleLabel, getRoleDescription } from '@/lib/rbac';
import { updateUserRoleAction, updateUserNameAction } from '@/app/admin/users/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole: Role;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  currentUserRole,
}: EditUserDialogProps) {
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState<Role>(user?.role || ROLES.MEMBER);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when user changes
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && user) {
      setName(user.name);
      setRole(user.role);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      // Update name if changed
      if (name !== user.name) {
        const nameResult = await updateUserNameAction(user.email, name);
        if (!nameResult.success) {
          toast.error(nameResult.message);
          setIsLoading(false);
          return;
        }
      }

      // Update role if changed
      if (role !== user.role) {
        const roleResult = await updateUserRoleAction(user.email, role);
        if (!roleResult.success) {
          toast.error(roleResult.message);
          setIsLoading(false);
          return;
        }
      }

      toast.success('User updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update user');
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is master admin (cannot be edited)
  const isMasterAdmin = user?.email === process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL;
  const canEditRole = currentUserRole === ROLES.MASTER_ADMIN || !isMasterAdmin;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and role. Changes will take effect immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Email (read-only) */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter user name"
                required
                disabled={isLoading}
              />
            </div>

            {/* Role */}
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as Role)}
                disabled={!canEditRole || isLoading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ROLES).map((roleValue) => (
                    <SelectItem key={roleValue} value={roleValue}>
                      <div className="flex flex-col">
                        <span className="font-medium">{getRoleLabel(roleValue)}</span>
                        <span className="text-xs text-muted-foreground">
                          {getRoleDescription(roleValue)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isMasterAdmin && currentUserRole !== ROLES.MASTER_ADMIN && (
                <p className="text-xs text-muted-foreground">
                  Master admin role cannot be changed
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="grid gap-1 rounded-lg border p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              {user?.invitedBy && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invited by:</span>
                  <span className="font-medium">{user.invitedBy}</span>
                </div>
              )}
              {user?.lastSignIn && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last sign in:</span>
                  <span className="font-medium">
                    {new Date(user.lastSignIn).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
