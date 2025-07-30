
"use client";

import { Pill, Shield, Zap, Flame } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock data simulating medication history
const mockMedicationHistory = [
  { date: '2023-01-15', name: 'Ramipril 5mg', category: 'ACEi/ARB' },
  { date: '2023-03-20', name: 'Prednisolone 40mg', category: 'Steroid' },
  { date: '2023-06-10', name: 'Dapagliflozin 10mg', category: 'SGLT2i' },
  { date: '2023-06-10', name: 'Telmisartan 40mg', category: 'ACEi/ARB' },
  { date: '2023-09-05', name: 'Prednisolone Taper', category: 'Steroid' },
  { date: '2023-11-22', name: 'Finerenone 10mg', category: 'MRA' },
  { date: '2024-02-01', name: 'Empagliflozin 10mg', category: 'SGLT2i' },
];

const categoryStyles: Record<string, { icon: React.ElementType, color: string }> = {
  'ACEi/ARB': { icon: Shield, color: 'bg-blue-500' },
  'SGLT2i': { icon: Zap, color: 'bg-green-500' },
  'Steroid': { icon: Flame, color: 'bg-orange-500' },
  'MRA': { icon: Pill, color: 'bg-purple-500' },
};

export function MedicationTimeline() {
    const sortedHistory = [...mockMedicationHistory].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  return (
    <ScrollArea className="h-64 w-full">
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2"></div>
        
        <div className="space-y-8">
          {sortedHistory.map((item, index) => {
            const style = categoryStyles[item.category] || { icon: Pill, color: 'bg-gray-400' };
            const Icon = style.icon;
            
            return (
              <div key={index} className="relative flex items-start">
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
