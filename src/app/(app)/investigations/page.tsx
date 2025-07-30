
"use client";

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { INVESTIGATION_MASTER_LIST, INVESTIGATION_PANELS } from '@/lib/constants';
import { Microscope, Beaker, Dna, Bone, Droplet, Send, Search, X, Package, TestTube, FlaskConical } from 'lucide-react';
import type { InvestigationMaster, InvestigationPanel } from '@/lib/types';
import { Badge } from '@/components/ui/badge';


const groupIcons: Record<string, React.ElementType> = {
  'Hematological': Droplet,
  'Biochemistry': Beaker,
  'Radiology': Bone,
  'Serology': Dna,
  'Special Investigations': Microscope,
  'Urine Analysis': FlaskConical,
  'Microbiology': TestTube,
};

// Organize tests and panels by group
const groupedData = INVESTIGATION_PANELS.reduce((acc, panel) => {
    if (!acc[panel.group]) {
        acc[panel.group] = { panels: [], tests: [] };
    }
    acc[panel.group].panels.push(panel);
    return acc;
}, {} as Record<string, { panels: InvestigationPanel[]; tests: InvestigationMaster[] }>);

INVESTIGATION_MASTER_LIST.forEach(test => {
    if (!groupedData[test.group]) {
        groupedData[test.group] = { panels: [], tests: [] };
    }
    groupedData[test.group].tests.push(test);
});


export default function InvestigationsPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>('Hematological');
  const [selectedTests, setSelectedTests] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const handleTestSelection = (testId: string) => {
    setSelectedTests(prev => ({ ...prev, [testId]: !prev[testId] }));
  };

  const handlePanelSelection = (panel: InvestigationPanel) => {
    const allTestsInPanelSelected = panel.testIds.every(id => selectedTests[id]);
    const newSelectedTests = { ...selectedTests };
    panel.testIds.forEach(id => {
        newSelectedTests[id] = !allTestsInPanelSelected;
    });
    setSelectedTests(newSelectedTests);
  };
  
  const selectedCount = Object.values(selectedTests).filter(Boolean).length;
  
  const filteredData = useMemo(() => {
    if (!searchQuery) {
        return groupedData[selectedGroup] || { panels: [], tests: [] };
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    
    const panels = INVESTIGATION_PANELS.filter(p => p.name.toLowerCase().includes(lowercasedQuery));
    const tests = INVESTIGATION_MASTER_LIST.filter(t => t.name.toLowerCase().includes(lowercasedQuery));
    
    return { panels, tests };
  }, [searchQuery, selectedGroup]);


  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Order Investigations"
        description="Select investigation panels or individual tests to order for a patient."
      />
      <Card className="mt-4 mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for any test or panel..."
              className="pl-10 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchQuery('')}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar for Groups */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-headline">Test Groups</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {Object.keys(groupedData).sort().map(groupName => {
                  const Icon = groupIcons[groupName] || Microscope;
                  return (
                    <Button
                      key={groupName}
                      variant={selectedGroup === groupName && !searchQuery ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => { setSelectedGroup(groupName); setSearchQuery(''); }}
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

        {/* Middle column for test/panel selection */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-headline">{searchQuery ? `Search Results for "${searchQuery}"` : `${selectedGroup} Tests & Panels`}</CardTitle>
              <CardDescription>Select panels or individual tests from the list below.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-3">
                {/* Panels Section */}
                {filteredData.panels.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-md font-semibold mb-2 flex items-center"><Package className="mr-2 h-4 w-4 text-primary"/>Investigation Panels</h3>
                        <div className="space-y-2">
                            {filteredData.panels.map(panel => (
                                <div key={panel.id} className="flex items-center space-x-3 p-3 rounded-md border bg-muted/40 hover:bg-muted transition-colors cursor-pointer" onClick={() => handlePanelSelection(panel)}>
                                    <Checkbox
                                        id={panel.id}
                                        checked={panel.testIds.every(id => selectedTests[id])}
                                        onCheckedChange={() => handlePanelSelection(panel)}
                                    />
                                    <div className="flex-grow">
                                        <Label htmlFor={panel.id} className="font-semibold cursor-pointer">{panel.name}</Label>
                                        <p className="text-xs text-muted-foreground">{panel.testIds.map(id => INVESTIGATION_MASTER_LIST.find(t => t.id === id)?.name).join(', ')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Individual Tests Section */}
                {filteredData.tests.length > 0 && (
                    <div>
                         <h3 className="text-md font-semibold mb-2 flex items-center"><TestTube className="mr-2 h-4 w-4 text-primary"/>Individual Tests</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filteredData.tests.map(test => (
                                <div key={test.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/40">
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
                    </div>
                )}
                
                {filteredData.panels.length === 0 && filteredData.tests.length === 0 && (
                    <div className="h-96 flex items-center justify-center text-muted-foreground">
                        <p>No tests or panels match your criteria.</p>
                    </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        {/* Right side for summary */}
        <div className="lg:col-span-3">
            <Card className="sticky top-6">
                 <CardHeader className="p-4">
                    <CardTitle className="text-lg font-headline">Selected Tests ({selectedCount})</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    <ScrollArea className="h-96 border rounded-md p-2">
                       {selectedCount > 0 ? (
                           <ul className="space-y-1">
                               {Object.entries(selectedTests).map(([testId, isSelected]) => {
                                   if (!isSelected) return null;
                                   const test = INVESTIGATION_MASTER_LIST.find(t => t.id === testId);
                                   return test ? (
                                     <li key={test.id} className="text-sm flex justify-between items-center p-1.5 rounded-md hover:bg-muted">
                                         <span>{test.name}</span>
                                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleTestSelection(testId)}><X className="h-3 w-3"/></Button>
                                     </li>
                                   ) : null;
                               })}
                           </ul>
                       ) : (
                           <div className="h-full flex items-center justify-center text-sm text-muted-foreground text-center">
                               Select tests or panels from the list.
                           </div>
                       )}
                    </ScrollArea>
                    <Button disabled={selectedCount === 0} className="w-full mt-4">
                        <Send className="mr-2 h-4 w-4" />
                        Order {selectedCount > 0 ? `${selectedCount} Test(s)` : 'Tests'} (WIP)
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
