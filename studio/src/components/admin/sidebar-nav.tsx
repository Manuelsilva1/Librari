"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookCopy,
  Tags,
  Building2,
  Store,
  Receipt,
  BarChart3,
  FileSpreadsheet,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  soon?: boolean;
}

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "Gestión",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/books", label: "Libros", icon: BookCopy },
      { href: "/categories", label: "Categorías", icon: Tags },
      { href: "/editorials", label: "Editoriales", icon: Building2 },
    ],
  },
  {
    title: "Ventas",
    items: [
      { href: "/pos", label: "Punto de venta", icon: Store },
      { href: "/sales", label: "Ventas", icon: Receipt },
      { href: "/stats", label: "Estadísticas", icon: BarChart3 },
      { href: "/reports", label: "Reportes", icon: FileSpreadsheet },
    ],
  },
  {
    title: "Usuarios",
    items: [
      {
        href: "/users",
        label: "Usuarios",
        icon: Users,
        disabled: true,
        soon: true,
      },
    ],
  },
];

export function SidebarNav({ lang }: { lang: string }): JSX.Element {
  const pathname = usePathname();

  return (
    <ScrollArea className="h-full">
      <nav className="space-y-4 px-2 py-4">
        {SECTIONS.map(({ title, items }) => (
          <div key={title} className="space-y-1">
            <p className="pl-3 pb-1 text-xs font-semibold uppercase text-muted-foreground">
              {title}
            </p>
            {items.map(({ href, label, icon: Icon, disabled, soon }) => {
              const active = pathname === `/${lang}/admin/panel${href}`;
              const classes = cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                disabled && "cursor-not-allowed opacity-50"
              );
              const content = (
                <>
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1 truncate">{label}</span>
                  {soon && <Badge variant="secondary">Pronto</Badge>}
                </>
              );
              return disabled ? (
                <span key={href} aria-disabled className={classes}>
                  {content}
                </span>
              ) : (
                <Link key={href} href={`/${lang}/admin/panel${href}`} className={classes}>
                  {content}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </ScrollArea>
  );
}
