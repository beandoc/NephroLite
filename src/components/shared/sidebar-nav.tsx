
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
  Waves, 
  Droplets,
  HeartPulse,
  LucideIcon,
  ListOrdered,
} from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matchStartsWith?: boolean;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, matchStartsWith: true },
  { href: "/my-schedule", label: "My Schedule", icon: CalendarRange },
  { href: "/registration", label: "Patient Search", icon: UserPlus, matchStartsWith: false },
  { href: "/patients/new", label: "New Patient Reg", icon: UserPlus },
  { href: "/opd-queue", label: "OPD Queue", icon: ListOrdered },
  { href: "/analytics", label: "Analytics", icon: BarChartBig, matchStartsWith: true },
  { href: "/patients", label: "Patient Management", icon: Users, matchStartsWith: true },
  { href: "/appointments", label: "Appointments", icon: CalendarDays, matchStartsWith: true },
  { href: "/search", label: "Advanced Search", icon: SearchCheck },
  { href: "/clinical-tools", label: "Clinical Tools", icon: Stethoscope },
  { href: "/communication", label: "Communication", icon: MessageCircle },
  { href: "/documents", label: "Documents", icon: FileText, disabled: true },
  { href: "/templates", label: "Templates", icon: FileSignature },
  { href: "/system", label: "System", icon: Settings2, disabled: true },
];

const analyticsSubNavItems: NavItem[] = [
    { href: "/analytics/medication-impact", label: "Medication Impact", icon: LineChart },
    { href: "/analytics/pd-module", label: "PD Module", icon: Waves },
    { href: "/analytics/hd-module", label: "HD Module", icon: Droplets, disabled: true },
    { href: "/analytics/transplant-module", label: "Transplant Module", icon: HeartPulse, disabled: true },
];


export function SidebarNav() {
  const pathname = usePathname();

  const isAnalyticsActive = pathname.startsWith('/analytics');

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        if (item.href === "/analytics") {
          return (
            <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                    <SidebarMenuButton
                        isActive={pathname === item.href}
                        className={cn(
                            (pathname === item.href) ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            "w-full justify-start"
                        )}
                        tooltip={item.label}
                        disabled={item.disabled}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                </Link>
                {isAnalyticsActive && (
                    <SidebarMenuSub>
                        {analyticsSubNavItems.map(subItem => (
                            <SidebarMenuSubItem key={subItem.label}>
                                <Link href={subItem.href} passHref legacyBehavior>
                                    <SidebarMenuSubButton
                                        isActive={pathname.startsWith(subItem.href)}
                                        disabled={subItem.disabled}
                                    >
                                        <subItem.icon className="h-4 w-4" />
                                        <span>{subItem.label}</span>
                                    </SidebarMenuSubButton>
                                </Link>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                )}
            </SidebarMenuItem>
          )
        }
        
        const isActive = item.matchStartsWith ? pathname.startsWith(item.href) : pathname === item.href;

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
                disabled={item.disabled}
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
