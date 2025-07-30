
"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link2, PlusCircle, ListOrdered, Stethoscope } from 'lucide-react';

const links = [
    { href: "/appointments/new", label: "Schedule New Appointment", icon: PlusCircle },
    { href: "/opd-queue", label: "Manage OPD Queue", icon: ListOrdered },
    { href: "/clinical-tools", label: "Open Clinical Tools", icon: Stethoscope },
    { href: "/patients/new", label: "Register New Patient", icon: PlusCircle },
];

export function QuickLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
            <Link2 className="mr-2 h-5 w-5 text-primary"/>Quick Links
        </CardTitle>
        <CardDescription>Navigate to frequently used sections.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
            {links.map(link => (
                <Button key={link.href} asChild variant="outline" className="justify-start">
                    <Link href={link.href}>
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                    </Link>
                </Button>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
