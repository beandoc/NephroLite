
"use client";

import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'; 
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CalendarDays, MessageSquare, Eye, Edit, Copy, Trash2, PlusCircle } from 'lucide-react';

interface MockVisitHistoryProps {
    patientId: string;
}

export const MockVisitHistory = ({ patientId }: MockVisitHistoryProps) => {
  const { toast } = useToast();
  const visits = [
    { id: 'v1', date: '2024-05-10', doctor: 'Dr. Anya Sharma', type: 'Routine Checkup', notes: 'BP stable, advised diet modification. Patient reports feeling well. Next follow-up in 3 months.' },
    { id: 'v2', date: '2024-02-15', doctor: 'Dr. Vikram Singh', type: 'RELAPSE', notes: 'Increased proteinuria, starting immunosuppressants.' },
    { id: 'v3', date: '2023-11-20', doctor: 'Dr. Anya Sharma', type: 'REMISSION', notes: 'Proteinuria significantly reduced, continuing current treatment.' },
    { id: 'v4', date: '2023-08-01', doctor: 'Dr. Priya Patel', type: 'CHANGED Rx', notes: 'Switched from ACEi to ARB due to cough.' },
    { id: 'v5', date: '2023-05-05', doctor: 'Dr. Rohan Gupta', type: 'LOW DRUG LEVEL', notes: 'Tacrolimus level below target, dose adjusted.' },
  ];

  const handleAddNewVisit = () => {
    toast({ title: "Feature Under Development", description: "Adding new visit records will be available soon." });
  };
  
  const handleVisitAction = (action: string, visitId: string) => {
     toast({ title: "Feature Under Development", description: `${action} functionality for visit ${visitId} is under development.` });
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddNewVisit}><PlusCircle className="mr-2 h-4 w-4"/>Add New Visit</Button>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {visits.map(visit => (
          <AccordionItem value={visit.id} key={visit.id} className="border-b last:border-b-0 rounded-md mb-2 shadow-sm bg-card">
            <AccordionTrigger className="hover:bg-muted/50 px-4 py-3 text-left rounded-t-md">
              <div className="flex items-center gap-4 w-full">
                <CalendarDays className="w-5 h-5 text-primary flex-shrink-0"/>
                <div className="flex-grow">
                  <p className="font-medium">{format(new Date(visit.date), 'PPP')} - <span className="font-semibold">{visit.type}</span></p>
                  <p className="text-sm text-muted-foreground">With {visit.doctor}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-4 bg-card rounded-b-md">
              <p className="text-sm text-foreground mt-2 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span className="font-medium">Remark: </span>
                  <span>{visit.notes || "No specific notes for this visit."}</span>
              </p>
              <div className="mt-3 pt-3 border-t flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleVisitAction('View Details', visit.id)} title="View Details (Under Development)">
                    <Eye className="w-4 h-4 mr-1"/> View
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleVisitAction('Edit Visit', visit.id)} title="Edit Visit (Under Development)">
                    <Edit className="w-4 h-4 mr-1"/> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleVisitAction('Copy Visit', visit.id)} title="Copy Visit (Under Development)">
                    <Copy className="w-4 h-4 mr-1"/> Copy
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/90" onClick={() => handleVisitAction('Delete Visit', visit.id)} title="Delete visit (Under Development)">
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
              </div>
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
