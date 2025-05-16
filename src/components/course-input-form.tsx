
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlusCircle } from "lucide-react";

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
import type { Course } from "@/types";
import { toast } from "@/hooks/use-toast";
import { letterGrades, letterGradeToGradePoint } from "@/lib/gpa-calculator";

const courseFormSchema = z.object({
  name: z.string().min(2, {
    message: "Course name must be at least 2 characters.",
  }),
  credits: z.coerce.number().min(0.5, {
    message: "Credits must be at least 0.5.",
  }).max(10, {
    message: "Credits cannot exceed 10.",
  }),
  letterGrade: z.string().refine(val => letterGrades.includes(val), {
    message: "Please select a valid grade.",
  }),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseInputFormProps {
  onAddCourse: (course: Omit<Course, 'id'>) => void;
}

export function CourseInputForm({ onAddCourse }: CourseInputFormProps) {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: "",
      credits: undefined,
      letterGrade: "F", // Default to F
    },
  });

  function onSubmit(data: CourseFormValues) {
    const gradePoint = letterGradeToGradePoint(data.letterGrade);
    onAddCourse({ name: data.name, credits: data.credits, gradePoint });
    form.reset();
    toast({
      title: "Course Added",
      description: `${data.name} has been successfully added.`,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Introduction to Programming" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="credits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credits</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 3" {...field} step="0.5" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="letterGrade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {letterGrades.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full md:w-auto transition-transform hover:scale-105">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </form>
    </Form>
  );
}
