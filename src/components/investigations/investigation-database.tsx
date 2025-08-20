
"use client";

import { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Edit, Trash2, Beaker, PackagePlus, FileBox } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { InvestigationMaster, InvestigationPanel } from '@/lib/types';
import { INVESTIGATION_GROUPS } from '@/lib/constants';
import { usePatientData } from '@/hooks/use-patient-data';

const investigationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Test name is required.'),
  group: z.enum(INVESTIGATION_GROUPS, { required_error: 'Group is required.' }),
  unit: z.string().optional(),
  normalRange: z.string().optional(),
});

type InvestigationFormData = z.infer<typeof investigationSchema>;

const panelSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Panel name is required.'),
  group: z.enum(INVESTIGATION_GROUPS, { required_error: 'Group is required.' }),
  testIds: z.array(z.object({ id: z.string() })).min(1, 'At least one test must be selected.'),
});

type PanelFormData = z.infer<typeof panelSchema>;


export function InvestigationDatabase() {
  const { 
    investigationMasterList, 
    investigationPanels, 
    addOrUpdateInvestigation, 
    deleteInvestigation,
    addOrUpdatePanel,
    deletePanel
  } = usePatientData();
  const { toast } = useToast();

  const [isInvestigationDialogOpen, setIsInvestigationDialogOpen] = useState(false);
  const [isPanelDialogOpen, setIsPanelDialogOpen] = useState(false);
  const [editingInvestigation, setEditingInvestigation] = useState<InvestigationMaster | null>(null);
  const [editingPanel, setEditingPanel] = useState<InvestigationPanel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const investigationForm = useForm<InvestigationFormData>({
    resolver: zodResolver(investigationSchema),
  });

  const panelForm = useForm<PanelFormData>({
    resolver: zodResolver(panelSchema),
    defaultValues: {
      testIds: [],
    }
  });
  
  const { fields: panelTestFields, append: appendTest, remove: removeTest } = useFieldArray({
    control: panelForm.control,
    name: "testIds"
  });


  const handleOpenInvestigationDialog = (inv?: InvestigationMaster) => {
    setEditingInvestigation(inv || null);
    investigationForm.reset(inv || { name: '', unit: '', normalRange: '' });
    setIsInvestigationDialogOpen(true);
  };

  const handleOpenPanelDialog = (panel?: InvestigationPanel) => {
    setEditingPanel(panel || null);
    panelForm.reset(panel ? { ...panel, testIds: panel.testIds.map(id => ({id})) } : { name: '', testIds: [] });
    setIsPanelDialogOpen(true);
  };

  const onSaveInvestigation = (data: InvestigationFormData) => {
    const investigationToSave: InvestigationMaster = {
      ...data,
      id: editingInvestigation?.id || data.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
    };
    addOrUpdateInvestigation(investigationToSave);
    toast({ title: `Investigation ${editingInvestigation ? 'Updated' : 'Added'}` });
    setIsInvestigationDialogOpen(false);
  };
  
  const onSavePanel = (data: PanelFormData) => {
    const panelToSave: InvestigationPanel = {
      ...data,
      id: editingPanel?.id || data.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
      testIds: data.testIds.map(item => item.id),
    };
    addOrUpdatePanel(panelToSave);
    toast({ title: `Panel ${editingPanel ? 'Updated' : 'Added'}` });
    setIsPanelDialogOpen(false);
  }

  const handleDeleteInvestigation = (id: string) => {
    deleteInvestigation(id);
    toast({ title: 'Investigation Deleted', variant: 'destructive' });
  };
  
  const handleDeletePanel = (id: string) => {
    deletePanel(id);
    toast({ title: 'Panel Deleted', variant: 'destructive' });
  }

  const filteredMasterList = useMemo(() => {
    return investigationMasterList.filter(inv => inv.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [investigationMasterList, searchQuery]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline flex items-center">
                <FileBox className="mr-2 h-6 w-6 text-primary" />
                Investigation Database
              </CardTitle>
              <CardDescription>Manage all individual tests and investigation panels available in the application.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleOpenPanelDialog()}>
                <PackagePlus className="mr-2 h-4 w-4" /> Add New Panel
              </Button>
              <Button onClick={() => handleOpenInvestigationDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Investigation
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Input 
            placeholder="Search investigations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Normal Range</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMasterList.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.name}</TableCell>
                    <TableCell>{inv.group}</TableCell>
                    <TableCell>{inv.unit || 'N/A'}</TableCell>
                    <TableCell>{inv.normalRange || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenInvestigationDialog(inv)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteInvestigation(inv.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Investigation Add/Edit Dialog */}
      <Dialog open={isInvestigationDialogOpen} onOpenChange={setIsInvestigationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingInvestigation ? 'Edit' : 'Add'} Investigation</DialogTitle>
          </DialogHeader>
          <Form {...investigationForm}>
            <form onSubmit={investigationForm.handleSubmit(onSaveInvestigation)} className="space-y-4">
              <FormField control={investigationForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={investigationForm.control} name="group" render={({ field }) => (
                 <FormItem>
                  <FormLabel>Group</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select group..." /></SelectTrigger></FormControl>
                    <SelectContent>{INVESTIGATION_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={investigationForm.control} name="unit" render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit (Optional)</FormLabel>
                  <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={investigationForm.control} name="normalRange" render={({ field }) => (
                <FormItem>
                  <FormLabel>Normal Range (Optional)</FormLabel>
                  <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Panel Add/Edit Dialog */}
       <Dialog open={isPanelDialogOpen} onOpenChange={setIsPanelDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPanel ? 'Edit' : 'Add'} Investigation Panel</DialogTitle>
          </DialogHeader>
          <Form {...panelForm}>
            <form onSubmit={panelForm.handleSubmit(onSavePanel)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={panelForm.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Panel Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={panelForm.control} name="group" render={({ field }) => (
                   <FormItem>
                    <FormLabel>Group</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select group..." /></SelectTrigger></FormControl>
                      <SelectContent>{INVESTIGATION_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField
                control={panelForm.control}
                name="testIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Select Tests</FormLabel>
                     <ScrollArea className="h-64 w-full rounded-md border p-4">
                        {investigationMasterList.map((item) => (
                          <FormField
                            key={item.id}
                            control={panelForm.control}
                            name="testIds"
                            render={({ field }) => (
                              <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.some(v => v.id === item.id)}
                                    onCheckedChange={(checked) => {
                                      const currentIds = field.value?.map(v => v.id) || [];
                                      if (checked) {
                                        if (!currentIds.includes(item.id)) {
                                          appendTest({ id: item.id });
                                        }
                                      } else {
                                        const indexToRemove = field.value?.findIndex(v => v.id === item.id);
                                        if (indexToRemove !== -1 && indexToRemove !== undefined) {
                                          removeTest(indexToRemove);
                                        }
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{item.name}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                 <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">Save Panel</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
