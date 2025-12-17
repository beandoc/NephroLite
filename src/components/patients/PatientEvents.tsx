
"use client";

import { Building, CalendarPlus, LogIn, LogOut, UserPlus, CalendarX } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo } from 'react';
import type { Patient, Visit } from '@/lib/types';


const eventTypeMap: Record<string, { icon: React.ElementType, color: string, description: (visit: Visit) => string }> = {
  'Admission': { icon: LogIn, color: 'bg-red-500', description: (v) => v.visitRemark },
  'Routine': { icon: CalendarPlus, color: 'bg-sky-500', description: (v) => v.visitRemark },
  'Emergency': { icon: CalendarPlus, color: 'bg-orange-500', description: (v) => v.visitRemark },
  'Proxy': { icon: CalendarPlus, color: 'bg-indigo-500', description: (v) => v.visitRemark },
  'Missed': { icon: CalendarX, color: 'bg-yellow-500', description: (v) => v.visitRemark },
};

interface PatientEventsProps {
  patient: Patient;
}

export function PatientEvents({ patient }: PatientEventsProps) {
  const eventHistory = useMemo(() => {
    // Defensive check: ensure visits array exists
    const visits = patient.visits || [];
    const registrationDate = patient.registrationDate ? parseISO(patient.registrationDate) : null;

    const events = visits
      .filter(visit => visit.date) // Skip visits without dates
      .filter(visit => {
        // Filter out visits marked as "initial" that happen after registration
        if (!registrationDate) return true;
        const visitDate = parseISO(visit.date);
        const isInitialVisit = visit.visitRemark?.toLowerCase().includes('initial');

        // If it's marked as initial but happens after registration, skip it
        if (isInitialVisit && visitDate > registrationDate) {
          return false;
        }
        return true;
      })
      .map(visit => ({
        date: visit.date,
        type: visit.visitType,
        description: visit.visitRemark || `${visit.visitType} visit`
      }));

    // Add registration event if date exists
    if (patient.registrationDate) {
      events.push({
        date: patient.registrationDate,
        type: 'Registered',
        description: 'Patient registered at the clinic.'
      });
    }

    // Add discharged/admitted events based on status changes if we track that in history
    // For now, we are basing events on visits.

    return events.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  }, [patient]);

  const eventStyles: Record<string, { icon: React.ElementType, color: string }> = {
    'Registered': { icon: UserPlus, color: 'bg-blue-500' },
    ...Object.fromEntries(Object.entries(eventTypeMap).map(([key, val]) => [key, { icon: val.icon, color: val.color }]))
  };

  if (eventHistory.length === 0) {
    return <div className="h-64 w-full flex items-center justify-center text-muted-foreground">No patient events recorded.</div>
  }

  return (
    <ScrollArea className="h-64 w-full">
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2"></div>

        <div className="space-y-8">
          {eventHistory.map((item, index) => {
            const style = eventStyles[item.type] || { icon: Building, color: 'bg-gray-400' };
            const Icon = style.icon;

            return (
              <div key={`${item.date}-${index}`} className="relative flex items-start">
                <div className={`absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full ${style.color} -translate-x-1/2 ring-4 ring-background`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="ml-8">
                  <p className="font-semibold text-sm">{item.type}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(item.date), 'PPP')}</p>
                  <p className="text-sm mt-1">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
