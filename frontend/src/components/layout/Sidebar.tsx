"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Ticket, Users, LogOut, User } from "lucide-react";

import { NAV_ITEMS } from "@/lib/navigation";
import { useMe } from "@/hooks/useMe";
import { cn } from "@/lib/utils";
import { api } from "@/lib/axios";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isLoading } = useMe();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  if (isLoading) {
    return (
      <aside className="flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-6">
        <div className="mb-8 h-6 w-40 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="space-y-2 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
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
    <aside className="flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-6">
      <Link href="/dashboard" className="flex items-center gap-3 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
          <Ticket className="h-5 w-5 text-zinc-100 dark:text-zinc-900" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">TicketsManage</span>
      </Link>

      <nav className="space-y-1 flex-1">
        {allowedItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <NavIcon label={item.label} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4 space-y-2">
        <Link
          href="/dashboard/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
            pathname === "/dashboard/profile"
              ? "bg-zinc-200 dark:bg-zinc-800"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {user.firstName || user.email.split("@")[0]}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              {user.role.replace("_", " ")}
            </p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
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
