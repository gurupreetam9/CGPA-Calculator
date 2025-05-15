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
import type { Course } from "@/types";
import { toast } from "@/hooks/use-toast";

const courseFormSchema = z.object({
  name: z.string().min(2, {
    message: "Course name must be at least 2 characters.",
  }),
  credits: z.coerce.number().min(0.5, {
    message: "Credits must be at least 0.5.",
  }).max(10, {
    message: "Credits cannot exceed 10.",
  }),
  gradePoint: z.coerce.number().min(0, {
    message: "Grade point must be at least 0.",
  }).max(10, { // Assuming a 0-10 scale. Adjust if needed.
    message: "Grade point cannot exceed 10.",
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
      credits: undefined, // Use undefined for number inputs to show placeholder
      gradePoint: undefined,
    },
  });

  function onSubmit(data: CourseFormValues) {
    onAddCourse(data);
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
            name="gradePoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade Point (0-10)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 8.5" {...field} step="0.1" />
                </FormControl>
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
