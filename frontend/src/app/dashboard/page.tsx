"use client";

import AppShell from "@/components/layout/AppShell";
import { useMe } from "@/hooks/useMe";

export default function DashboardPage() {
  const { data, isLoading, error } = useMe();

  return (
    <AppShell>
      <h2 className="mb-4 text-2xl font-semibold">Dashboard</h2>

      {isLoading && <p>Loading user...</p>}

      {error && (
        <p className="text-red-500">Not authenticated or backend offline</p>
      )}

      {data && (
        <div className="rounded-md border bg-white p-4 text-sm">
          Logged in as <strong>{data.email}</strong> ({data.role})
        </div>
      )}
    </AppShell>
  );
}
