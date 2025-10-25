'use client';

import { signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Settings } from 'lucide-react';

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function UserNav({ user }: UserNavProps) {
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() || 'U';

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'MASTER_ADMIN':
        return 'default';
      case 'ADMIN':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'MASTER_ADMIN':
        return 'Master Admin';
      case 'ADMIN':
        return 'Admin';
      default:
        return 'Member';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <Badge variant={getRoleBadgeVariant(user.role)} className="w-fit">
              {getRoleLabel(user.role)}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/admin/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
