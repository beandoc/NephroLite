
"use client";

import type { Visit } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'; 
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CalendarDays, MessageSquare, Eye, Edit, Copy, Trash2, PlusCircle } from 'lucide-react';
import { ClinicalVisitDetails } from '@/components/visits/ClinicalVisitDetails';

interface MockVisitHistoryProps {
    visits: Visit[];
    onAddNewVisit: () => void;
}

export const MockVisitHistory = ({ visits, onAddNewVisit }: MockVisitHistoryProps) => {
  const { toast } = useToast();
  
  const handleVisitAction = (action: string, visitId: string) => {
     toast({ title: "Feature Under Development", description: `${action} functionality for visit ${visitId} is under development.` });
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={onAddNewVisit}><PlusCircle className="mr-2 h-4 w-4"/>Add New Visit</Button>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {visits.map(visit => (
          <AccordionItem value={visit.id} key={visit.id} className="border-b last:border-b-0 rounded-md mb-2 shadow-sm bg-card">
            <AccordionTrigger className="hover:bg-muted/50 px-4 py-3 text-left rounded-t-md">
              <div className="flex items-center gap-4 w-full">
                <CalendarDays className="w-5 h-5 text-primary flex-shrink-0"/>
                <div className="flex-grow">
                  <p className="font-medium">{format(new Date(visit.date), 'PPP')} - <span className="font-semibold">{visit.visitType}</span></p>
                  <p className="text-sm text-muted-foreground">Remark: {visit.visitRemark}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-0 sm:px-4 pt-2 pb-4 bg-card rounded-b-md">
              <ClinicalVisitDetails visit={visit} />
            </AccordionContent>
          </AccordionItem>
        ))}
        {visits.length === 0 && (
          <Card className="flex items-center justify-center h-32 border-dashed">
            <p className="text-muted-foreground text-center py-4">No visit history recorded.</p>
          </Card>
        )}
      </Accordion>
    </>
  );
};
