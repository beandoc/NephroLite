
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
import { Stethoscope } from "lucide-react"; // Using Stethoscope as a placeholder logo icon

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/90">
            <Stethoscope className="h-7 w-7 text-primary" />
            <span className="font-headline group-data-[collapsible=icon]:hidden">NephroLite</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="h-full">
            <SidebarNav />
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-2">
          {/* Sidebar footer content if any */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
          <SidebarTrigger className="md:hidden" /> {/* Mobile trigger */}
          <div className="flex-1">
            {/* Optional: Breadcrumbs or page title here */}
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
