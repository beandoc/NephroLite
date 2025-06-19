
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChartBig,
  Users,
  CalendarDays,
  Stethoscope,
  MessageCircle,
  FileText,
  Settings2,
  FileSignature,
  SearchCheck,
  LineChart,
  CalendarRange,
  UserPlus, // Added UserPlus
  LucideIcon
} from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matchStartsWith?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, matchStartsWith: true },
  { href: "/my-schedule", label: "My Schedule", icon: CalendarRange },
  { href: "/registration", label: "New Registration", icon: UserPlus, matchStartsWith: false }, // matchStartsWith specific for registration & new patient
  { href: "/analytics", label: "Analytics Dashboard", icon: BarChartBig, matchStartsWith: false },
  { href: "/analytics/medication-impact", label: "Medication Impact", icon: LineChart },
  { href: "/patients", label: "Patient Management", icon: Users, matchStartsWith: true },
  { href: "/appointments", label: "Appointments", icon: CalendarDays, matchStartsWith: true },
  { href: "/search", label: "Advanced Search", icon: SearchCheck },
  { href: "/clinical-tools", label: "Clinical Tools", icon: Stethoscope },
  { href: "/communication", label: "Communication", icon: MessageCircle },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/templates", label: "Templates", icon: FileSignature },
  { href: "/system", label: "System", icon: Settings2 },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        let isActive = item.matchStartsWith ? pathname.startsWith(item.href) : pathname === item.href;

        // Special handling for /patients to include its sub-routes like /patients/new or /patients/[id]/edit
        // but not /patients/[id]/create-visit unless explicitly handled by another item
        if (item.href === "/patients") {
            isActive = pathname.startsWith("/patients") && !pathname.includes("/create-visit");
        }

        // Ensure "New Registration" is active if on /registration OR /patients/new
        if (item.href === "/registration") {
            isActive = pathname === "/registration" || pathname === "/patients/new";
        }

        // Example of how you might handle patient-specific sub-routes if you add a "Patient Dashboard" link
        // if (item.href.startsWith("/patients/") && item.href.includes("[id]")) {
        //   const basePatientPath = item.href.split("/[id]")[0];
        //   isActive = pathname.startsWith(basePatientPath + "/") && pathname.split("/").length === item.href.split("/").length;
        // }


        return (
          <SidebarMenuItem key={item.label}>
            <Link href={item.href}>
              <SidebarMenuButton
                isActive={isActive}
                className={cn(
                  isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "w-full justify-start"
                )}
                tooltip={item.label}
              >
                <item.icon className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
