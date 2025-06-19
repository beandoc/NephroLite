
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Search, Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function RegistrationPage() {
  const [searchNephroId, setSearchNephroId] = useState('');
  const [searchPatientName, setSearchPatientName] = useState('');
  const { toast } = useToast();

  const handleSearch = () => {
    // Placeholder for actual search logic
    console.log("Searching for Nephro ID:", searchNephroId, "or Name:", searchPatientName);
    toast({
      title: "Search Under Development",
      description: "Patient search functionality will be implemented soon.",
    });
    // In a real app, you'd fetch patient data and display results or navigate.
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-patient-name">Patient Full Name</Label>
              <Input
                id="search-patient-name"
                placeholder="Enter patient's full name"
                value={searchPatientName}
                onChange={(e) => setSearchPatientName(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch} className="w-full" disabled> {/* Search button is disabled for now */}
              <Search className="mr-2 h-5 w-5" /> Search Patient (Under Development)
            </Button>
          </CardContent>
        </Card>
      </div>
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
