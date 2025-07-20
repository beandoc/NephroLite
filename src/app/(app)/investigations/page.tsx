
"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { INVESTIGATION_MASTER_LIST } from '@/lib/constants';
import { Microscope, Beaker, Dna, Bone, Droplet, Send } from 'lucide-react';
import type { InvestigationMaster } from '@/lib/types';

// Group investigations by their group name
const investigationGroups = INVESTIGATION_MASTER_LIST.reduce((acc, test) => {
  if (!acc[test.group]) {
    acc[test.group] = [];
  }
  acc[test.group].push(test);
  return acc;
}, {} as Record<string, InvestigationMaster[]>);

const groupIcons: Record<string, React.ElementType> = {
  'Hematological': Droplet,
  'Biochemistry': Beaker,
  'Radiology': Bone,
  'Serology': Dna,
  'Special Investigations': Microscope,
};

export default function InvestigationsPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>(Object.keys(investigationGroups)[0]);
  const [selectedTests, setSelectedTests] = useState<Record<string, boolean>>({});

  const handleTestSelection = (testId: string) => {
    setSelectedTests(prev => ({
      ...prev,
      [testId]: !prev[testId],
    }));
  };
  
  const selectedCount = Object.values(selectedTests).filter(Boolean).length;

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Order Investigations"
        description="Select investigations to order for a patient. This is the master list for ordering."
        actions={
          <Button disabled={selectedCount === 0}>
            <Send className="mr-2 h-4 w-4" />
            Order {selectedCount > 0 ? `${selectedCount} Test(s)` : 'Tests'} (WIP)
          </Button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        
        {/* Left Sidebar for Groups */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-headline">Test Groups</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {Object.keys(investigationGroups).map(groupName => {
                  const Icon = groupIcons[groupName] || Microscope;
                  return (
                    <Button
                      key={groupName}
                      variant={selectedGroup === groupName ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setSelectedGroup(groupName)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {groupName}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side for test selection */}
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-headline">{selectedGroup} Tests</CardTitle>
              <CardDescription>Select the tests you want to order from the list below.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] border rounded-md p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(investigationGroups[selectedGroup] || []).map(test => (
                    <div
                      key={test.id}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted"
                    >
                      <Checkbox
                        id={test.id}
                        checked={!!selectedTests[test.id]}
                        onCheckedChange={() => handleTestSelection(test.id)}
                      />
                      <Label htmlFor={test.id} className="font-normal cursor-pointer flex-grow">
                        {test.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
