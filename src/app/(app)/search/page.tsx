
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { CalendarIcon, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const searchFormSchema = z.object({
  dob: z.string().optional(),
  patientName: z.string().optional(),
  mobileNumber: z.string().optional(),
  abhaId: z.string().optional(),
  nephroId: z.string().optional(),
  serviceName: z.string().optional(),
  whatsappNumber: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchFormSchema>;

export default function AdvancedSearchPage() {
  const { toast } = useToast();

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      dob: "",
      patientName: "",
      mobileNumber: "",
      abhaId: "",
      nephroId: "",
      serviceName: "",
      whatsappNumber: "",
    },
  });

  function onSubmit(data: SearchFormData) {
    console.log("Search criteria:", data);
    toast({
      title: "Search Submitted",
      description: "Search functionality is under development. Criteria logged to console.",
    });
  }

  return (
    <div className="container mx-auto py-2">
      <PageHeader title="Advance Search Patient" description="Enter criteria to find patient records." />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-headline">Search Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => {
                    const { formItemId, formDescriptionId, formMessageId, error } = useFormField();
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                id={formItemId}
                                aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
                                aria-invalid={!!error}
                              >
                                {field.value ? (
                                  format(parseISO(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? parseISO(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              initialFocus
                              captionLayout="dropdown-buttons"
                              fromYear={1900}
                              toYear={new Date().getFullYear()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="nephroId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nephro Id</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., RTTT/0625" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter patient name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serviceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter service name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Enter mobile number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Whatsapp Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Enter WhatsApp number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="abhaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abha Id</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Abha ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                <SearchIcon className="mr-2 h-4 w-4" /> Search
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
