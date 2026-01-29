"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Ticket, Users } from "lucide-react";

import { NAV_ITEMS } from "@/lib/navigation";
import { useMe } from "@/hooks/useMe";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: user, isLoading } = useMe();

  if (isLoading) {
    return (
      <aside className="w-64 border-r bg-white px-4 py-6">
        <div className="mb-8 h-6 w-40 rounded bg-muted animate-pulse" />

        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-9 rounded bg-muted animate-pulse"
            />
          ))}
        </div>
      </aside>
    );
  }

  if (!user) return null;

  const allowedItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 border-r bg-white px-4 py-6">
      <h1 className="mb-8 text-xl font-semibold">TicketsManage</h1>

      <nav className="space-y-1">
        {allowedItems.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-slate-100"
              )}
            >
              <NavIcon label={item.label} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}


function NavIcon({ label }: { label: string }) {
  switch (label) {
    case "Dashboard":
      return <LayoutDashboard size={18} />;
    case "My Tickets":
    case "Assigned Tickets":
      return <Ticket size={18} />;
    case "Admin Panel":
      return <Users size={18} />;
    default:
      return null;
  }
}
