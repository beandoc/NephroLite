
"use client";

import { Pill, Shield, Zap, Flame } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo } from 'react';
import type { Visit } from '@/lib/types';
import { SGLT2_INHIBITORS, ARBS, ACE_INHIBITORS, FINERENONE } from '@/lib/constants';

const categoryStyles: Record<string, { icon: React.ElementType, color: string }> = {
  'ACEi/ARB': { icon: Shield, color: 'bg-blue-500' },
  'SGLT2i': { icon: Zap, color: 'bg-green-500' },
  'Steroid': { icon: Flame, color: 'bg-orange-500' },
  'MRA': { icon: Pill, color: 'bg-purple-500' },
  'Other': { icon: Pill, color: 'bg-gray-400' }
};

const getCategory = (medName: string): string => {
    const lowerMedName = medName.toLowerCase();
    if (SGLT2_INHIBITORS.some(drug => lowerMedName.includes(drug.toLowerCase()))) return 'SGLT2i';
    if ([...ARBS, ...ACE_INHIBITORS].some(drug => lowerMedName.includes(drug.toLowerCase()))) return 'ACEi/ARB';
    if (lowerMedName.includes(FINERENONE.toLowerCase())) return 'MRA';
    if (lowerMedName.includes('prednisolone') || lowerMedName.includes('steroid')) return 'Steroid';
    return 'Other';
};


interface MedicationTimelineProps {
    visits: Visit[];
}

export function MedicationTimeline({ visits }: MedicationTimelineProps) {
    const medicationHistory = useMemo(() => {
        return visits
            .flatMap(visit => 
                visit.clinicalData?.medications?.map(med => ({
                    date: visit.date,
                    name: `${med.name} ${med.dosage || ''}`.trim(),
                    category: getCategory(med.name),
                })) || []
            )
            .filter(item => item.name) // Filter out items without a name
            .sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    }, [visits]);


    if (medicationHistory.length === 0) {
        return <div className="h-64 w-full flex items-center justify-center text-muted-foreground">No medication history recorded.</div>
    }

  return (
    <ScrollArea className="h-64 w-full">
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2"></div>
        
        <div className="space-y-8">
          {medicationHistory.map((item, index) => {
            const style = categoryStyles[item.category] || categoryStyles['Other'];
            const Icon = style.icon;
            
            return (
              <div key={`${item.date}-${item.name}-${index}`} className="relative flex items-start">
                <div className={`absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full ${style.color} -translate-x-1/2 ring-4 ring-background`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="ml-8">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(item.date), 'PPP')}</p>
                  <Badge variant="outline" className="mt-1 text-xs">{item.category}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
