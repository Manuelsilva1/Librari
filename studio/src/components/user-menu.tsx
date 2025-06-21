"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-provider";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Dictionary } from "@/types";

interface UserMenuProps {
  lang: string;
  dictionary: Dictionary;
}

export function UserMenu({ lang, dictionary }: UserMenuProps) {
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label={dictionary.header.profile ?? "Profile"}>
          <Avatar>
            {user?.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.nombre} />
            ) : (
              <AvatarFallback>{user?.nombre?.charAt(0) ?? "U"}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/admin/panel`}>
            {dictionary.adminPanel?.footer?.text ?? "Admin Panel"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>
          {dictionary.header.logout ?? "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
