"use client";

import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types";

interface CourseListTableProps {
  courses: Course[];
  onDeleteCourse: (courseId: string) => void;
}

export function CourseListTable({ courses, onDeleteCourse }: CourseListTableProps) {
  if (courses.length === 0) {
    return (
      <div className="mt-6 py-8 px-4 text-center border-2 border-dashed border-border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No courses added for this semester yet.</p>
        <p className="text-sm text-muted-foreground/80">Use the form above to add your courses.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Course Name</TableHead>
            <TableHead className="text-center">Credits</TableHead>
            <TableHead className="text-center">Grade Point</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium">{course.name}</TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary">{course.credits.toFixed(1)}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{course.gradePoint.toFixed(1)}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteCourse(course.id)}
                  aria-label={`Delete course ${course.name}`}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
