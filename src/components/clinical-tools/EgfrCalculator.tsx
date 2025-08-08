
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import { GENDERS } from '@/lib/constants';

const egfrSchema = z.object({
  creatinine: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Creatinine must be a positive number.')
  ),
  age: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().positive('Age must be a positive integer.')
  ),
  gender: z.enum(['Male', 'Female']),
});

type EgfrFormData = z.infer<typeof egfrSchema>;

export function EgfrCalculator() {
  const [egfrResult, setEgfrResult] = useState<number | null>(null);

  const form = useForm<EgfrFormData>({
    resolver: zodResolver(egfrSchema),
    defaultValues: {
      creatinine: undefined,
      age: undefined,
      gender: 'Male',
    },
  });

  const onSubmit = (data: EgfrFormData) => {
    const { creatinine, age, gender } = data;
    const kappa = gender === 'Female' ? 0.7 : 0.9;
    const alpha = gender === 'Female' ? -0.329 : -0.411;
    const genderCoefficient = gender === 'Female' ? 1.018 : 1;
    
    const scrOverKappa = creatinine / kappa;

    const minTerm = Math.min(scrOverKappa, 1) ** alpha;
    const maxTerm = Math.max(scrOverKappa, 1) ** -1.209;
    const ageTerm = 0.993 ** age;

    const egfr = 141 * minTerm * maxTerm * ageTerm * genderCoefficient;

    setEgfrResult(egfr);
  };
  
  const handleFormChange = () => {
    if (egfrResult !== null) {
      setEgfrResult(null);
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" onChange={handleFormChange}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="creatinine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serum Creatinine (mg/dL)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 1.2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (years)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full">
            <Calculator className="mr-2 h-4 w-4" /> Calculate eGFR
          </Button>
        </form>
      </Form>
      {egfrResult !== null && (
        <Card className="bg-muted/50 mt-4">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Calculated eGFR</p>
            <p className="text-4xl font-bold text-primary">{egfrResult.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">mL/min/1.73m²</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
