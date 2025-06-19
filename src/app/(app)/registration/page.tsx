
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Search, Users, ListChecks, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { usePatientData } from '@/hooks/use-patient-data';
import type { Patient } from '@/lib/types';

export default function RegistrationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { patients, isLoading: patientsLoading } = usePatientData();

  const [searchNephroId, setSearchNephroId] = useState('');
  const [searchPatientName, setSearchPatientName] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

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
      foundPatients = patients.filter(p => p.nephroId.toLowerCase() === termNephroId);
    } else if (termName) {
      foundPatients = patients.filter(p => p.name.toLowerCase().includes(termName));
    }

    if (foundPatients.length === 1) {
      toast({
        title: "Patient Found",
        description: `Redirecting to ${foundPatients[0].name}'s profile.`,
      });
      router.push(`/patients/${foundPatients[0].id}`);
    } else if (foundPatients.length > 1) {
      setSearchResults(foundPatients);
      toast({
        title: "Multiple Patients Found",
        description: "Please select from the list below.",
      });
    } else {
      setSearchResults([]); // Empty array indicates search was performed but no results
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
        title="Patient Registration & Search"
        description="Register a new patient or find an existing patient record."
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <UserPlus className="mr-2 h-6 w-6 text-primary" />
              Register New Patient
            </CardTitle>
            <CardDescription>
              Create a new comprehensive record for a patient visiting for the first time.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              Click the button below to open the new patient registration form. You will be guided through entering their demographic, clinical, and service-related details.
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/patients/new">
                <UserPlus className="mr-2 h-5 w-5" /> Go to New Patient Form
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <Search className="mr-2 h-6 w-6 text-primary" />
              Search Existing Patient
            </CardTitle>
            <CardDescription>
              Find an existing patient by their Nephro ID or full name to view or update their records.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="search-nephro-id">Nephro ID</Label>
              <Input
                id="search-nephro-id"
                placeholder="e.g., NL-0001"
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
            <Button onClick={handleSearch} className="w-full" disabled={isSearching || patientsLoading}>
              <Search className="mr-2 h-5 w-5" /> {isSearching ? "Searching..." : "Search Patient"}
            </Button>
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
                No patient found matching your criteria. You can{' '}
                <Link href="/patients/new" className="text-primary hover:underline">
                  register a new patient
                </Link>.
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
                        <Eye className="mr-2 h-4 w-4" /> View Profile
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

       <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <Users className="mr-2 h-6 w-6 text-primary" />
            View All Patients
          </CardTitle>
          <CardDescription>
            Access the complete list of all registered patients in the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center">
           <p className="mb-4 text-sm text-muted-foreground">
              To browse all patient records, edit existing profiles, or manage patient data globally, proceed to the Patient Management section.
            </p>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/patients">
              <Users className="mr-2 h-5 w-5" /> Go to Patient List
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
