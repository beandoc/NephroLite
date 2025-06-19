
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
  { href: "/registration", label: "New Registration", icon: UserPlus, matchStartsWith: true }, // Added New Registration link
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
        // Ensure patients/new and patients/[id]/edit are active when patients is active
        let isActive = item.matchStartsWith ? pathname.startsWith(item.href) : pathname === item.href;
        if (item.href === "/patients" && (pathname.startsWith("/patients/new") || pathname.match(/^\/patients\/[^/]+\/edit$/))) {
          isActive = true;
        }
        // Ensure /registration and /patients/new are active when New Registration is active
        if (item.href === "/registration" && pathname.startsWith("/patients/new")) {
          isActive = true;
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
