
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BookPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { formatSemesterKey } from "@/lib/gpa-calculator";


const manualSgpaSchema = z.object({
  year: z.string().min(1, "Year is required."),
  semesterInYear: z.string().min(1, "Semester is required."),
  sgpa: z.coerce.number().min(0, "SGPA must be at least 0.").max(10, "SGPA cannot exceed 10."),
  totalCredits: z.coerce.number().min(0.5, "Total credits must be at least 0.5.").max(100, "Total credits seem too high."),
});

type ManualSgpaFormValues = z.infer<typeof manualSgpaSchema>;

interface ManualSgpaFormProps {
  onAddManualSgpa: (year: number, semesterInYear: number, sgpa: number, totalCredits: number) => void;
  existingSemesterKeys: string[];
}

const years = [1, 2, 3, 4];
const semesters = [1, 2];

export function ManualSgpaForm({ onAddManualSgpa, existingSemesterKeys }: ManualSgpaFormProps) {
  const form = useForm<ManualSgpaFormValues>({
    resolver: zodResolver(manualSgpaSchema),
    defaultValues: {
      year: undefined,
      semesterInYear: undefined,
      sgpa: undefined,
      totalCredits: undefined,
    },
  });

  function onSubmit(data: ManualSgpaFormValues) {
    const year = parseInt(data.year, 10);
    const semesterInYear = parseInt(data.semesterInYear, 10);
    const semesterKey = `Y${year}S${semesterInYear}`;

    if (existingSemesterKeys.includes(semesterKey)) {
      toast({
        title: "Semester Exists",
        description: `Data for ${formatSemesterKey(semesterKey)} already exists. You might want to edit it or ensure courses are added under semester selection.`,
        variant: "destructive",
      });
      return;
    }
    
    onAddManualSgpa(year, semesterInYear, data.sgpa, data.totalCredits);
    form.reset();
    toast({
      title: "Manual SGPA Added",
      description: `SGPA for Year ${year}, Semester ${semesterInYear} has been recorded.`,
    });
  }


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <BookPlus className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl font-semibold">Manual SGPA Entry</CardTitle>
            <CardDescription>
              Enter SGPA for past semesters if you don&apos;t want to add individual courses.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="semesterInYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {semesters.map(s => <SelectItem key={s} value={s.toString()}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sgpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SGPA (0-10)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 7.8" {...field} step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalCredits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Credits for Semester</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 20" {...field} step="0.5" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full md:w-auto transition-transform hover:scale-105">
              <BookPlus className="mr-2 h-4 w-4" /> Add Manual SGPA
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
