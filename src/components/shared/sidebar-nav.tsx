
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
  UserPlus,
  Waves, // Added for PD Module
  Droplets, // Added for HD Module
  HeartPulse, // Added for Transplant Module
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
  { href: "/registration", label: "New Registration", icon: UserPlus, matchStartsWith: false },
  { href: "/analytics", label: "Analytics Dashboard", icon: BarChartBig, matchStartsWith: false }, // Keep matchStartsWith: false for parent if children have more specific matches
  { href: "/analytics/medication-impact", label: "Medication Impact", icon: LineChart },
  { href: "/analytics/pd-module", label: "PD Module", icon: Waves }, // New PD Module link
  { href: "#", label: "HD Module (WIP)", icon: Droplets }, // Placeholder HD Module
  { href: "#", label: "Transplant Module (WIP)", icon: HeartPulse }, // Placeholder Transplant Module
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

        // Ensure "/analytics" itself is active only when it's the exact path,
        // and not when its children like "/analytics/medication-impact" are active.
        if (item.href === "/analytics" && item.matchStartsWith === false) {
          isActive = pathname === item.href;
        }
        // Ensure "/analytics/pd-module" is active when it's the exact path
        if (item.href === "/analytics/pd-module") {
            isActive = pathname === item.href;
        }


        if (item.href === "/patients") {
            isActive = pathname.startsWith("/patients") && !pathname.includes("/create-visit");
        }

        if (item.href === "/registration") {
            isActive = pathname === "/registration" || pathname === "/patients/new";
        }


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
