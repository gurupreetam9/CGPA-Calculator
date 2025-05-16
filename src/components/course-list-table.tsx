
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    <div className="mt-6 overflow-x-auto rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Removed min-w-[150px] and adjusted w-auto for better flex on small screens */}
            <TableHead className="w-auto sm:w-2/5">Course Name</TableHead>
            <TableHead className="text-center w-[80px] sm:w-1/5">Credits</TableHead>
            <TableHead className="text-center w-[110px] sm:w-1/5">Grade</TableHead>
            <TableHead className="text-right w-[70px] sm:w-1/5">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium py-3 pr-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block truncate max-w-[12ch] xs:max-w-[15ch] sm:max-w-none"> {/* Truncate with char limit on small, no limit on sm+ */}
                        {course.name}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{course.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
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
                  className="text-destructive hover:bg-destructive/10 h-8 w-8 sm:h-9 sm:w-9"
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
