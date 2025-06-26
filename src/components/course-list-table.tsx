
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
    <div className="mt-6">
      {/* Desktop View: Table */}
      <div className="hidden md:block rounded-lg border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/5">Course Name</TableHead>
              <TableHead className="text-center w-1/5">Credits</TableHead>
              <TableHead className="text-center w-1/5">Grade</TableHead>
              <TableHead className="text-right w-1/5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium py-3 pr-2">{course.name}</TableCell>
                <TableCell className="text-center py-3 px-2">
                  <Badge variant="secondary">{course.credits.toFixed(1)}</Badge>
                </TableCell>
                <TableCell className="text-center py-3 px-1">
                  <Select
                    value={gradePointToLetterGrade(course.gradePoint)}
                    onValueChange={(newLetterGrade) => handleGradeChange(course.id, newLetterGrade)}
                  >
                    <SelectTrigger className="w-full max-w-[6.5rem] h-9 text-sm mx-auto">
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {letterGrades.map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right py-3 pl-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteCourse(course.id)}
                    aria-label={`Delete course ${course.name}`}
                    className="text-destructive hover:bg-destructive/10 h-9 w-9"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View: Card List */}
      <div className="block md:hidden space-y-4">
        {courses.map((course) => (
          <Card key={course.id} className="shadow-md">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
               <CardTitle className="text-base font-semibold leading-snug">{course.name}</CardTitle>
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteCourse(course.id)}
                  aria-label={`Delete course ${course.name}`}
                  className="text-destructive hover:bg-destructive/10 h-8 w-8 -mt-2 -mr-2 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 items-center pt-0">
                <div className="space-y-1">
                    <Label htmlFor={`credits-${course.id}`} className="text-xs text-muted-foreground">Credits</Label>
                    <div id={`credits-${course.id}`}>
                        <Badge variant="secondary">{course.credits.toFixed(1)}</Badge>
                    </div>
                </div>
                <div className="space-y-1">
                    <Label htmlFor={`grade-${course.id}`} className="text-xs text-muted-foreground">Grade</Label>
                     <Select
                        value={gradePointToLetterGrade(course.gradePoint)}
                        onValueChange={(newLetterGrade) => handleGradeChange(course.id, newLetterGrade)}
                     >
                        <SelectTrigger id={`grade-${course.id}`} className="h-9 text-sm">
                            <SelectValue placeholder="Select Grade" />
                        </SelectTrigger>
                        <SelectContent>
                            {letterGrades.map(grade => (
                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
