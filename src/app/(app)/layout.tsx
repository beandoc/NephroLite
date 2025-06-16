
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { UserNav } from "@/components/shared/user-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { CircleDot, LogOut } from "lucide-react"; 
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-4 flex flex-col items-start">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground hover:text-sidebar-foreground/90 mb-1">
            <CircleDot className="h-7 w-7 text-sidebar-foreground" />
            <span className="font-headline group-data-[collapsible=icon]:hidden">NephroConnect</span>
          </Link>
          <div className="ml-1 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-sidebar-foreground">Dr. Sarah Johnson</p>
            <p className="text-xs text-sidebar-foreground/80">Nephrology Specialist</p>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="h-full">
            <SidebarNav />
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border">
           <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center">
             <LogOut className="h-5 w-5 group-data-[collapsible=icon]:mr-0 mr-2" />
             <span className="group-data-[collapsible=icon]:hidden">Logout</span>
           </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
          <SidebarTrigger className="md:hidden" /> {/* Mobile trigger */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patients, records..."
                className="pl-8 sm:w-full md:w-1/3 lg:w-1/4 h-9"
              />
            </div>
          </div>
          <UserNav />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
