
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, Bell, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePatientData } from "@/hooks/use-patient-data";
import { useMemo } from "react";
import type { Patient, InvestigationTest } from "@/lib/types";
import { MOCK_USER } from "@/lib/constants";

const isCritical = (test: InvestigationTest): boolean => {
  if (!test.result || !test.normalRange || test.normalRange === 'N/A') return false;
  const resultValue = parseFloat(test.result);
  if (isNaN(resultValue)) return false;
  const rangeMatch = test.normalRange.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (rangeMatch) {
    const lowerBound = parseFloat(rangeMatch[1]);
    const upperBound = parseFloat(rangeMatch[2]);
    return resultValue < lowerBound || resultValue > upperBound;
  }
  const lowerBoundMatch = test.normalRange.match(/>\s*([\d.]+)/);
  if (lowerBoundMatch) { return resultValue < parseFloat(lowerBoundMatch[1]); }
  const upperBoundMatch = test.normalRange.match(/<\s*([\d.]+)/);
  if(upperBoundMatch) { return resultValue > parseFloat(upperBoundMatch[1]); }
  return false;
};

export function UserNav() {
  const { patients, isLoading } = usePatientData();

  const criticalResultsCount = useMemo(() => {
    if (isLoading) return 0;
    const allCriticalResults = new Set<string>();
    patients.forEach(patient => {
      patient.investigationRecords?.forEach(record => {
        record.tests.forEach(test => {
          if (isCritical(test)) {
            allCriticalResults.add(patient.id);
          }
        });
      });
    });
    return allCriticalResults.size;
  }, [patients, isLoading]);

  const user = MOCK_USER;

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9">
        <Bell className="h-5 w-5" />
        {criticalResultsCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 min-w-4 p-0 flex items-center justify-center text-xs">
                {criticalResultsCount}
            </Badge>
        )}
        <span className="sr-only">Notifications</span>
      </Button>
      <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9">
        <MessageSquare className="h-5 w-5" />
        {/* Placeholder for messages */}
        <span className="sr-only">Messages</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="doctor avatar" />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'DS'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
