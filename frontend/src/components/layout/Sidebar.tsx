import Link from "next/link";
import { LayoutDashboard, Ticket, Users } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white px-4 py-6">
      <h1 className="mb-8 text-xl font-semibold">TicketsManage</h1>

      <nav className="space-y-1">
        <Link
          href="/dashboard"
          className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100"
        >
          Dashboard
        </Link>

        <Link
          href="/tickets"
          className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100"
        >
          Tickets
        </Link>

        <Link
          href="/agent/dashboard"
          className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100"
        >
          Agent
        </Link>

        <Link
          href="/admin/dashboard"
          className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100"
        >
          Admin
        </Link>
      </nav>
    </aside>
  );
}
