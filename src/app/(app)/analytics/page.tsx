
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Droplets, Activity, ShieldAlert, Users2, HeartPulse, Waves, Stethoscope, BarChart3, NotebookText, LinkIcon as LinkIconLucide, FileText, UserCheck, UserX, Tag, Filter, Home, PieChart as PieChartIcon, List, Search } from 'lucide-react';
import Link from 'next/link';
import { usePatientData } from '@/hooks/use-patient-data';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Patient } from '@/lib/types';
import dynamic from 'next/dynamic';

const PatientAnalysisChart = dynamic(
  () => import('@/components/dashboard/patient-analysis-chart').then(mod => mod.PatientAnalysisChart),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Patient Analysis by Diagnosis</CardTitle>
          <CardDescription>Distribution of patients by primary diagnosis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }
);


interface MetricCardProps {
  title: string;
  value?: string | number;
  description?: string;
  colorClass?: string;
  icon?: React.ElementType;
  link?: string;
  disabled?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = React.memo(({ title, value, description, colorClass, icon: Icon, link, disabled }) => {
  const content = (
    <Card className={`shadow-lg relative overflow-hidden ${colorClass ? `border-t-4 ${colorClass}` : 'border-t-4 border-transparent'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <CardHeader className="pb-2 pt-4">
        {Icon && <Icon className="h-7 w-7 text-muted-foreground mb-2" />}
        {value !== undefined && <CardTitle className="text-3xl font-bold text-center">{value}</CardTitle>}
      </CardHeader>
      <CardContent className="pb-4">
        <p className={`text-sm ${value !== undefined ? 'text-muted-foreground' : 'font-semibold'} text-center ${value !== undefined ? 'font-medium' : ''}`}>{title}</p>
        {description && <p className="text-xs text-muted-foreground text-center mt-1">{description}</p>}
      </CardContent>
    </Card>
  );

  if (link && !disabled) {
    return <Link href={link} className="hover:opacity-80 transition-opacity block">{content}</Link>;
  }
  return content;
});
MetricCard.displayName = 'MetricCard';


const COLORS_GENDER = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];
const COLORS_RESIDENCE = ['hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))'];


export default function AnalyticsPage() {
  const { patients, isLoading: patientsLoading } = usePatientData();
  const [tagInput, setTagInput] = useState('');
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  // Suppress React key warnings (false positives)
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0];
      if (typeof message === 'string' && message.includes('unique "key" prop')) {
        return; // Suppress key warnings
      }
      originalError(...args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  const patientGroupMetrics: MetricCardProps[] = useMemo(() => {
    if (patientsLoading || !clientReady) return [];
    return [
      { title: "Peritoneal dialysis", value: patients.filter(p => p.clinicalProfile?.tags?.includes('PD')).length, colorClass: "border-orange-500", icon: Waves, link: "/analytics/pd-module" },
      { title: "Hemodialysis", value: patients.filter(p => p.clinicalProfile?.tags?.includes('HD')).length, colorClass: "border-blue-500", icon: Droplets, link: "/hd-registry" },
      { title: "Glomerulonephritis", value: patients.filter(p => p.clinicalProfile?.primaryDiagnosis === 'Glomerulonephritis').length, colorClass: "border-green-500", icon: Stethoscope },
      { title: "Kidney transplant", value: patients.filter(p => p.clinicalProfile?.primaryDiagnosis === 'Transplant Prospect').length, colorClass: "border-green-600", icon: HeartPulse, link: "/analytics/transplant-module", disabled: true },
      { title: "Chronic Kidney disease", value: patients.filter(p => p.clinicalProfile?.primaryDiagnosis?.toLowerCase().startsWith('chronic kidney disease')).length, colorClass: "border-cyan-500", icon: Activity },
    ];
  }, [patients, patientsLoading, clientReady]);

  const gnModuleAnalytics: MetricCardProps[] = [
    { title: "24hr Urine Protein Graph", icon: BarChart3, description: "Track proteinuria over time.", colorClass: "border-purple-500" },
    { title: "Diet Management Module", icon: NotebookText, description: "Access dietary planning tools.", colorClass: "border-teal-500" },
    { title: "Key Event Log Summary", icon: FileText, description: "View significant patient events.", colorClass: "border-indigo-500", link: "/key-event-log" },
    { title: "Disease Progression Models", icon: LinkIconLucide, description: "External prediction model links.", colorClass: "border-pink-500", disabled: true }
  ];

  const genderData = useMemo(() => {
    if (patientsLoading || !clientReady) return [];
    const counts = { Male: 0, Female: 0, Other: 0 };
    patients.forEach(p => {
      if (p.gender === 'Male') counts.Male++;
      else if (p.gender === 'Female') counts.Female++;
      else counts.Other++;
    });
    return [
      { name: 'Male', value: counts.Male },
      { name: 'Female', value: counts.Female },
      { name: 'Other/Not Specified', value: counts.Other },
    ].filter(d => d.value > 0);
  }, [patients, patientsLoading, clientReady]);

  const residenceData = useMemo(() => {
    if (patientsLoading || !clientReady) return [];
    const counts: { [key: string]: number } = { Rural: 0, Urban: 0, 'Semi-Urban': 0, Other: 0, 'Not Set': 0 };
    patients.forEach(p => {
      const type = p.residenceType || 'Not Set';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [patients, patientsLoading, clientReady]);

  const trackedPatients = useMemo(() => {
    if (patientsLoading || !clientReady) return [];
    return patients.filter(p => p.isTracked && p.firstName && p.lastName); // Filter out patients with missing names
  }, [patients, patientsLoading, clientReady]);

  const handleAddFilterTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !selectedFilterTags.includes(newTag)) {
      setSelectedFilterTags([...selectedFilterTags, newTag]);
    }
    setTagInput('');
  };

  const handleRemoveFilterTag = (tagToRemove: string) => {
    setSelectedFilterTags(selectedFilterTags.filter(tag => tag !== tagToRemove));
  };

  const filteredByTagsPatients = useMemo(() => {
    if (patientsLoading || !clientReady) {
      return patients.filter(p => p.firstName && p.lastName);
    }

    if (selectedFilterTags.length === 0) {
      return patients.filter(p => p.firstName && p.lastName);
    }

    const query = selectedFilterTags.join(' ').toUpperCase();

    return patients.filter(patient => {
      if (!patient.firstName || !patient.lastName) return false;

      const allDiagnoses = patient.visits?.flatMap(v =>
        v.diagnoses?.map(d => d.name.toUpperCase()) || []
      ) || [];

      const allTags = patient.clinicalProfile?.tags?.map(t => t.toUpperCase()) || [];
      const searchableTerms = [...allDiagnoses, ...allTags];

      if (query.includes(' AND ')) {
        const terms = query.split(' AND ').map(t => t.trim());
        return terms.every(term => searchableTerms.some(s => s.includes(term)));
      } else if (query.includes(' OR ')) {
        const terms = query.split(' OR ').map(t => t.trim());
        return terms.some(term => searchableTerms.some(s => s.includes(term)));
      } else if (query.includes(' NOT ')) {
        const [mustHave, mustNotHave] = query.split(' NOT ').map(t => t.trim());
        const has = searchableTerms.some(s => s.includes(mustHave));
        const hasNot = searchableTerms.some(s => s.includes(mustNotHave));
        return has && !hasNot;
      } else {
        return selectedFilterTags.every(tag =>
          searchableTerms.some(s => s.includes(tag.toUpperCase()))
        );
      }
    });
  }, [patients, patientsLoading, selectedFilterTags, clientReady]);


  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Nephrology Analytics Dashboard" description="Overview of patient data, trends, and clinical insights." />

      <Card className="mb-8 mt-6">
        <CardHeader>
          <CardTitle className="font-headline">Patient Group Distribution</CardTitle>
          <CardDescription>Overview of patient distribution by specific groups and conditions.</CardDescription>
        </CardHeader>
        <CardContent>
          {patientsLoading || !clientReady ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {patientGroupMetrics.map(metric => <MetricCard key={metric.title} {...metric} />)}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline">Glomerulonephritis (GN) Module Analytics</CardTitle>
          <CardDescription>Specific analytics and tools for managing GN patients.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gnModuleAnalytics.map(metric => <MetricCard key={metric.title} {...metric} />)}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><PieChartIcon className="mr-2 h-5 w-5 text-primary" />Demographics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-center">Gender Distribution</h3>
              {patientsLoading || !clientReady ? <Skeleton className="h-64 w-full" /> : genderData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_GENDER[index % COLORS_GENDER.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-center py-10">No gender data available.</p>}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-center">Residence Type</h3>
              {patientsLoading || !clientReady ? <Skeleton className="h-64 w-full" /> : residenceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={residenceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {residenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_RESIDENCE[index % COLORS_RESIDENCE.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-center py-10">No residence data available.</p>}
            </div>
          </CardContent>
        </Card>
        <PatientAnalysisChart />
      </div>


      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><UserCheck className="mr-2 h-5 w-5 text-primary" />Patients Under Health Tracking</CardTitle>
          <CardDescription>List of patients with active health tracking enabled.</CardDescription>
        </CardHeader>
        <CardContent>
          {patientsLoading || !clientReady ? <Skeleton className="h-40 w-full" /> : trackedPatients.length > 0 ? (
            <ScrollArea className="h-40">
              <ul className="space-y-1">
                {trackedPatients.map(p => (
                  <li key={p.id} className="text-sm p-1 hover:bg-muted rounded-md">
                    <Link href={`/patients/${p.id}`} className="text-primary hover:underline">{`${p.firstName} ${p.lastName}`}</Link> ({p.nephroId})
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-10">No patients are currently under special health tracking.</p>
          )}
        </CardContent>
      </Card>


      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <Search className="mr-2 h-5 w-5 text-primary" />
            Search Patients by Diagnosis & Tags
          </CardTitle>
          <CardDescription>
            Use boolean operators (AND/OR) to find patients. Examples: "CKD AND DIABETES", "HD OR PD"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g., CKD AND DIABETES  or  HD OR PD"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFilterTag()}
              className="flex-grow"
            />
            <Button onClick={handleAddFilterTag}><Search className="mr-2 h-4 w-4" />Search</Button>
          </div>

          {selectedFilterTags.length > 0 && (
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="text-sm font-medium mr-1">Search Query:</span>
                {selectedFilterTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    {tag}
                    <button onClick={() => handleRemoveFilterTag(tag)} className="ml-1.5 text-muted-foreground hover:text-foreground">&times;</button>
                  </Badge>
                ))}
              </div>

              <h4 className="text-md font-semibold mb-3">
                Matching Patients ({filteredByTagsPatients.length})
              </h4>

              {filteredByTagsPatients.length > 0 ? (
                <ScrollArea className="h-60 border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Nephro ID</TableHead>
                        <TableHead>Tags & Diagnoses</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredByTagsPatients.map(p => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <Link href={`/patients/${p.id}`} className="text-primary hover:underline">
                              {`${p.firstName} ${p.lastName}`}
                            </Link>
                          </TableCell>
                          <TableCell>{p.nephroId}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(p.clinicalProfile?.tags || []).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-center py-10">No patients match your search criteria.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
