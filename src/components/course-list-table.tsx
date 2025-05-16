
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Course } from "@/types";
import { letterGrades, letterGradeToGradePoint, gradePointToLetterGrade } from "@/lib/gpa-calculator";

interface CourseListTableProps {
  courses: Course[];
  onDeleteCourse: (courseId: string) => void;
  onUpdateCourseGrade: (courseId: string, newGradePoint: number) => void;
}

export function CourseListTable({ courses, onDeleteCourse, onUpdateCourseGrade }: CourseListTableProps) {

  const handleGradeChange = (courseId: string, newLetterGrade: string) => {
    const newGradePoint = letterGradeToGradePoint(newLetterGrade);
    // Find the original course to check if the value actually changed from the stored one
    const originalCourse = courses.find(c => c.id === courseId);
    if (originalCourse && originalCourse.gradePoint !== newGradePoint) {
        onUpdateCourseGrade(courseId, newGradePoint);
    }
  };

  if (courses.length === 0) {
    return (
      <div className="mt-6 py-8 px-4 text-center border-2 border-dashed border-border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No courses added for this semester yet.</p>
        <p className="text-sm text-muted-foreground/80">Use the form below to add your courses.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Course Name</TableHead>
            <TableHead className="text-center w-[20%]">Credits</TableHead>
            <TableHead className="text-center w-[20%]">Grade</TableHead>
            <TableHead className="text-right w-[20%]">Actions</TableHead>
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
                <Select
                  value={gradePointToLetterGrade(course.gradePoint)}
                  onValueChange={(newLetterGrade) => handleGradeChange(course.id, newLetterGrade)}
                >
                  <SelectTrigger className="w-24 mx-auto h-9 text-sm">
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {letterGrades.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
