
"use client";

import { History } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SemesterDetails } from "@/types";
import { formatSemesterKey } from "@/lib/gpa-calculator";

interface CgpaHistoryTableProps {
  semestersData: Record<string, SemesterDetails>;
}

export function CgpaHistoryTable({ semestersData }: CgpaHistoryTableProps) {
  const sortedSemesters = Object.values(semestersData)
    .filter(sem => sem.sgpa !== null && sem.totalCredits > 0) // Only show semesters with calculated/entered SGPA
    .sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return a.semesterInYear - b.semesterInYear;
    });

  if (sortedSemesters.length === 0) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            <div>
              <CardTitle id="additional-tools-title" className="text-2xl font-semibold">CGPA History</CardTitle>
              <CardDescription>No semester data available to display history.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground p-4">
            Add courses or manually enter SGPA for past semesters to see history.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
         <div className="flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            <div>
              <CardTitle id="additional-tools-title" className="text-2xl font-semibold">CGPA History</CardTitle>
              <CardDescription>Summary of your SGPA for each semester.</CardDescription>
            </div>
          </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableCaption>A list of your semester performance.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Semester</TableHead>
              <TableHead className="text-center">Total Credits</TableHead>
              <TableHead className="text-center">SGPA</TableHead>
              <TableHead className="text-center">Entry Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSemesters.map((semester) => (
              <TableRow key={semester.id}>
                <TableCell className="font-medium">{formatSemesterKey(semester.id)}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{semester.totalCredits.toFixed(1)}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="default">{semester.sgpa !== null ? semester.sgpa.toFixed(2) : "N/A"}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  {semester.isManual ? (
                    <Badge variant="outline" className="border-accent text-accent-foreground">Manual</Badge>
                  ) : (
                    <Badge variant="outline">Calculated</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
