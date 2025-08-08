
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
import { Calculator, ShieldAlert, AlertTriangle } from 'lucide-react';
import { calculateKfre } from '@/lib/kfre-calculator';
import { GENDERS } from '@/lib/constants';

const kfreSchema = z.object({
  age: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(18, "Age must be 18 or older.").max(100, "Age must be 100 or younger.")
  ),
  gender: z.enum(['Male', 'Female']),
  egfr: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().min(1, "eGFR must be positive.").max(59, "eGFR must be less than 60 for KFRE calculation.")
  ),
  uacr: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('UACR must be a positive number.')
  ),
});

type KfreFormData = z.infer<typeof kfreSchema>;

const getRiskLevel = (value: number | null): "High Risk" | "Medium Risk" | "Low Risk" => {
    if (value === null) return "Low Risk"; // Should not happen if calculated
    if (value > 20) return "High Risk";
    if (value > 5) return "Medium Risk";
    return "Low Risk";
};


export function KfreCalculator() {
  const [kfreResult, setKfreResult] = useState<{ twoYear: number; fiveYear: number } | null>(null);

  const form = useForm<KfreFormData>({
    resolver: zodResolver(kfreSchema),
    defaultValues: {
      age: undefined,
      gender: 'Male',
      egfr: undefined,
      uacr: undefined,
    },
  });

  const onSubmit = (data: KfreFormData) => {
    const result = calculateKfre({
        age: data.age,
        sex: data.gender,
        egfr: data.egfr,
        uacr: data.uacr,
    });
    
    if (result.twoYear !== null && result.fiveYear !== null) {
        setKfreResult({ twoYear: result.twoYear, fiveYear: result.fiveYear });
    } else {
        setKfreResult(null);
    }
  };
  
  const handleFormChange = () => {
    if (kfreResult !== null) {
      setKfreResult(null);
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" onChange={handleFormChange}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <FormItem>
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
             <FormField
              control={form.control}
              name="egfr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>eGFR (mL/min/1.73m²)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="e.g., 45" {...field} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="uacr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urine ACR (mg/g)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="e.g., 300" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full">
            <Calculator className="mr-2 h-4 w-4" /> Calculate KFRE
          </Button>
        </form>
      </Form>
      {kfreResult !== null && (
        <Card className="bg-muted/50 mt-4">
          <CardContent className="p-4 grid grid-cols-2 gap-4">
            <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1"><AlertTriangle className="w-4 h-4"/>2-Year Risk</p>
                <p className="text-3xl font-bold text-primary">{kfreResult.twoYear.toFixed(1)}%</p>
                <p className={`text-xs font-semibold ${getRiskLevel(kfreResult.twoYear) === "High Risk" ? "text-destructive" : getRiskLevel(kfreResult.twoYear) === "Medium Risk" ? "text-yellow-600" : "text-green-600"}`}>
                    {getRiskLevel(kfreResult.twoYear)}
                </p>
            </div>
             <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1"><AlertTriangle className="w-4 h-4"/>5-Year Risk</p>
                <p className="text-3xl font-bold text-primary">{kfreResult.fiveYear.toFixed(1)}%</p>
                <p className={`text-xs font-semibold ${getRiskLevel(kfreResult.fiveYear) === "High Risk" ? "text-destructive" : getRiskLevel(kfreResult.fiveYear) === "Medium Risk" ? "text-yellow-600" : "text-green-600"}`}>
                    {getRiskLevel(kfreResult.fiveYear)}
                </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
