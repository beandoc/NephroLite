
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

const bmiSchema = z.object({
  height: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Height must be positive.')
  ),
  weight: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Weight must be positive.')
  ),
});

type BmiFormData = z.infer<typeof bmiSchema>;

export function BmiCalculator() {
  const [bmiResult, setBmiResult] = useState<number | null>(null);

  const form = useForm<BmiFormData>({
    resolver: zodResolver(bmiSchema),
    defaultValues: {
      height: undefined,
      weight: undefined,
    },
  });

  const onSubmit = (data: BmiFormData) => {
    const heightInMeters = data.height / 100;
    const bmi = data.weight / (heightInMeters * heightInMeters);
    setBmiResult(bmi);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 175" {...field} onChange={e => { field.onChange(e.target.value); setBmiResult(null); }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 70" {...field} onChange={e => { field.onChange(e.target.value); setBmiResult(null); }}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full">
            <Calculator className="mr-2 h-4 w-4" /> Calculate BMI
          </Button>
        </form>
      </Form>
      {bmiResult !== null && (
        <Card className="bg-muted/50 mt-4">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Calculated BMI</p>
            <p className="text-3xl font-bold text-primary">{bmiResult.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">kg/m²</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
