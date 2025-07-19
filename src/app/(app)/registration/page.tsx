
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Search, Users, ListChecks } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { usePatientData } from '@/hooks/use-patient-data';
import type { Patient } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function RegistrationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { patients, isLoading: patientsLoading } = usePatientData();

  const [searchNephroId, setSearchNephroId] = useState('');
  const [searchPatientName, setSearchPatientName] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [alphabeticalPatients, setAlphabeticalPatients] = useState<Patient[]>([]);
  const [byRegistrationDatePatients, setByRegistrationDatePatients] = useState<Patient[]>([]);

  useEffect(() => {
    if (!patientsLoading && patients.length > 0) {
      const alphaSorted = [...patients].sort((a, b) => a.name.localeCompare(b.name));
      setAlphabeticalPatients(alphaSorted.slice(0, 5));

      const dateSorted = [...patients].sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
      setByRegistrationDatePatients(dateSorted.slice(0, 5));
    } else if (!patientsLoading) {
        setAlphabeticalPatients([]);
        setByRegistrationDatePatients([]);
    }
  }, [patients, patientsLoading]);


  const handleSearch = () => {
    setIsSearching(true);
    setSearchResults(null);

    const termNephroId = searchNephroId.trim().toLowerCase();
    const termName = searchPatientName.trim().toLowerCase();

    if (!termNephroId && !termName) {
      toast({
        title: "Search Criteria Needed",
        description: "Please enter a Nephro ID or Patient Name to search.",
        variant: "destructive",
      });
      setIsSearching(false);
      return;
    }

    let foundPatients: Patient[] = [];

    if (termNephroId) {
      foundPatients = patients.filter(p => {
        const [prefix, dateSuffix] = p.nephroId.split('/');
        const [searchPrefix, searchDateSuffix] = termNephroId.split('/');
        
        if (searchDateSuffix) { 
            return p.nephroId.toLowerCase() === termNephroId;
        } else { 
            return prefix.toLowerCase() === searchPrefix;
        }
      });
    } else if (termName) {
      foundPatients = patients.filter(p => p.name.toLowerCase().includes(termName));
    }
    
    // Simplified: always show list, never auto-redirect.
    setSearchResults(foundPatients);
    if (foundPatients.length > 0) {
        toast({
            title: `${foundPatients.length} Patient(s) Found`,
            description: "Please select a patient to view their profile.",
        });
    } else {
        toast({
            title: "No Patient Found",
            description: "No patient record matches your search criteria.",
        });
    }
    
    setIsSearching(false);
  };

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Patient Search"
        description="Find an existing patient to view their profile and manage their care."
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <Search className="mr-2 h-6 w-6 text-primary" />
              Search Existing Patient
            </CardTitle>
            <CardDescription>
              Find an existing patient to view their records and visit history. New patient registration is temporarily disabled for system upgrades.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="search-nephro-id">Nephro ID (e.g., SS123 or SS123/0624)</Label>
              <Input
                id="search-nephro-id"
                placeholder="e.g., SS123 or SS123/0624"
                value={searchNephroId}
                onChange={(e) => setSearchNephroId(e.target.value)}
                disabled={isSearching || patientsLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-patient-name">Patient Full Name</Label>
              <Input
                id="search-patient-name"
                placeholder="Enter patient's full name"
                value={searchPatientName}
                onChange={(e) => setSearchPatientName(e.target.value)}
                disabled={isSearching || patientsLoading}
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleSearch} className="w-full" disabled={isSearching || patientsLoading}>
                <Search className="mr-2 h-5 w-5" /> {isSearching ? "Searching..." : "Search Patient"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {searchResults !== null && (
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <ListChecks className="mr-2 h-6 w-6 text-primary" />
              Search Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No patient found matching your criteria.
              </p>
            ) : (
              <ul className="space-y-3">
                {searchResults.map(patient => (
                  <li key={patient.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                    <div>
                      <p className="font-semibold">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">Nephro ID: {patient.nephroId} &bull; DOB: {patient.dob}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/patients/${patient.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-8 shadow-lg md:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <Users className="mr-2 h-6 w-6 text-primary" />
            Registered Patients Overview
          </CardTitle>
          <CardDescription>
            Quick view of registered patients. For full details and more options, visit the main patient list.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-semibold mb-2">By Name (A-Z, Top 5)</h3>
            {patientsLoading ? <Skeleton className="h-20 w-full" /> : alphabeticalPatients.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {alphabeticalPatients.map(p => (
                  <li key={p.id}>
                    <Link href={`/patients/${p.id}`} className="text-primary hover:underline">{p.name}</Link> ({p.nephroId})
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">No patients found.</p>}
          </div>
          <div>
            <h3 className="text-md font-semibold mb-2">By Registration Date (Newest, Top 5)</h3>
            {patientsLoading ? <Skeleton className="h-20 w-full" /> : byRegistrationDatePatients.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {byRegistrationDatePatients.map(p => (
                  <li key={p.id}>
                    <Link href={`/patients/${p.id}`} className="text-primary hover:underline">{p.name}</Link> ({p.nephroId}) - Reg: {new Date(p.registrationDate).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">No patients found.</p>}
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t mt-4">
          <Button asChild variant="outline" className="w-full sm:w-auto mx-auto">
            <Link href="/patients">
              <Users className="mr-2 h-5 w-5" /> Go to Full Patient List
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
