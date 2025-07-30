
"use client";

import { Building, CalendarPlus, LogIn, LogOut, UserPlus, CalendarX } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock data simulating patient events
const mockEventHistory = [
  { date: '2024-02-05', type: 'Missed Visit', description: 'Scheduled follow-up was missed.' },
  { date: '2024-01-22', type: 'Discharge', description: 'Discharged after 5 days. Condition stable.' },
  { date: '2024-01-17', type: 'Admission', description: 'Admitted for acute kidney injury management.' },
  { date: '2023-11-10', type: 'Follow-up Visit', description: 'Routine checkup, labs reviewed.' },
  { date: '2023-08-01', type: 'Registered', description: 'Patient registered at the clinic.' },
];

const eventStyles: Record<string, { icon: React.ElementType, color: string }> = {
  'Registered': { icon: UserPlus, color: 'bg-blue-500' },
  'Admission': { icon: LogIn, color: 'bg-red-500' },
  'Discharge': { icon: LogOut, color: 'bg-green-500' },
  'Follow-up Visit': { icon: CalendarPlus, color: 'bg-sky-500' },
  'Missed Visit': { icon: CalendarX, color: 'bg-yellow-500' },
};

export function PatientEvents() {
    const sortedHistory = [...mockEventHistory].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  return (
    <ScrollArea className="h-64 w-full">
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2"></div>
        
        <div className="space-y-8">
          {sortedHistory.map((item, index) => {
            const style = eventStyles[item.type] || { icon: Building, color: 'bg-gray-400' };
            const Icon = style.icon;
            
            return (
              <div key={index} className="relative flex items-start">
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
