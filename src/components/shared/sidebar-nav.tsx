
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
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, matchStartsWith: true }, // Overview will link to dashboard
  { href: "/analytics", label: "Analytics", icon: BarChartBig },
  { href: "/patients", label: "Patient Management", icon: Users, matchStartsWith: true },
  { href: "/appointments", label: "Appointments", icon: CalendarDays, matchStartsWith: true },
  { href: "/clinical-tools", label: "Clinical Tools", icon: Stethoscope },
  { href: "/communication", label: "Communication", icon: MessageCircle },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/system", label: "System", icon: Settings2 },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isActive = item.matchStartsWith ? pathname.startsWith(item.href) : pathname === item.href;
        // Special case for exact match for dashboard/overview if needed, but startsWith should be fine.
        // If href is "/dashboard" (Overview), and current path is "/dashboard/some-other-page", it will still be active.
        // If only "/dashboard" should be active for Overview, then matchStartsWith should be false for it.
        // Given current setup, "/dashboard" is the overview page.
        
        return (
          <SidebarMenuItem key={item.label}>
            <Link href={item.href} passHref legacyBehavior>
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
