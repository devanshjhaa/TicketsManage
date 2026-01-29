import { Role } from "@/types/user";

export type NavItem = {
  label: string;
  href: string;
  roles: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    roles: ["USER", "SUPPORT_AGENT", "ADMIN"],
  },
  {
    label: "My Tickets",
    href: "/tickets",
    roles: ["USER"],
  },
  {
    label: "Assigned Tickets",
    href: "/agent/tickets",
    roles: ["SUPPORT_AGENT"],
  },
  {
    label: "Admin Panel",
    href: "/admin",
    roles: ["ADMIN"],
  },
];
