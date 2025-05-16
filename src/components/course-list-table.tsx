
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
import { Input } from "@/components/ui/input";
import type { Course } from "@/types";
import { useState } from "react";

interface CourseListTableProps {
  courses: Course[];
  onDeleteCourse: (courseId: string) => void;
  onUpdateCourseGrade: (courseId: string, newGradePoint: number) => void;
}

export function CourseListTable({ courses, onDeleteCourse, onUpdateCourseGrade }: CourseListTableProps) {
  // Local state to manage input values to avoid updating global state on every keystroke
  const [editingGradePoints, setEditingGradePoints] = useState<Record<string, string>>({});

  const handleGradeChange = (courseId: string, value: string) => {
    setEditingGradePoints(prev => ({ ...prev, [courseId]: value }));
  };

  const handleGradeBlur = (courseId: string, currentValue: string) => {
    const newGradePoint = parseFloat(currentValue);
    // Find the original course to check if the value actually changed from the stored one
    const originalCourse = courses.find(c => c.id === courseId);

    if (!isNaN(newGradePoint) && newGradePoint >= 0 && newGradePoint <= 10) {
      // Only call update if the valid new number is different from the original gradePoint
      if (originalCourse && originalCourse.gradePoint !== newGradePoint) {
        onUpdateCourseGrade(courseId, newGradePoint);
      }
      // Clear the local editing state for this course if it was valid or unchanged
      // This allows the input to reflect the global state if it's re-rendered
      setEditingGradePoints(prev => {
        const newState = { ...prev };
        delete newState[courseId];
        return newState;
      });
    } else if (currentValue !== "" && originalCourse && String(originalCourse.gradePoint) !== currentValue) {
      // If input is invalid but not empty, and different from original, notify parent (which will show toast)
      // The parent's validation will handle the toast
      onUpdateCourseGrade(courseId, newGradePoint); // This will trigger validation in parent
      // Optionally, revert local state if parent rejects or keep it to show user their invalid input
      // For now, we allow parent to handle, local state might persist invalid input until corrected
    }
    // If the value is empty or identical to original and valid, no update call needed.
    // Local state might still hold empty string, which is fine as placeholder.
  };


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
            <TableHead className="text-center w-[20%]">Credits</TableHead>
            <TableHead className="text-center w-[20%]">Grade Point (0-10)</TableHead>
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
                <Input
                  type="number"
                  value={editingGradePoints[course.id] ?? course.gradePoint.toString()}
                  onChange={(e) => handleGradeChange(course.id, e.target.value)}
                  onBlur={(e) => handleGradeBlur(course.id, e.target.value)}
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-20 text-center mx-auto h-8 px-2 py-1"
                  placeholder="0.0"
                />
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
