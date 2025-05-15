"use client";

import { Calculator } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface GpaDisplayProps {
  currentSgpa: number | null;
  overallCgpa: number | null;
  selectedSemesterKey: string | null;
  isLoading?: boolean;
}

export function GpaDisplay({ currentSgpa, overallCgpa, selectedSemesterKey, isLoading = false }: GpaDisplayProps) {
  const sgpaText = currentSgpa !== null ? currentSgpa.toFixed(2) : "N/A";
  const cgpaText = overallCgpa !== null ? overallCgpa.toFixed(2) : "N/A";

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Calculator className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl font-semibold">GPA Overview</CardTitle>
            <CardDescription>Your current SGPA and overall CGPA.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-around items-center gap-4 p-4 rounded-lg bg-secondary/30">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {selectedSemesterKey ? `Current SGPA` : "SGPA"}
            </p>
            {isLoading ? (
              <Skeleton className="h-10 w-24 mt-1" />
            ) : (
              <p className="text-3xl font-bold text-primary">{sgpaText}</p>
            )}
          </div>
          <div className="h-12 w-px bg-border hidden sm:block" />
          <div className="w-full h-px bg-border sm:hidden" />
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Overall CGPA</p>
            {isLoading ? (
              <Skeleton className="h-10 w-24 mt-1" />
            ) : (
            <p className="text-3xl font-bold text-accent-foreground">{cgpaText}</p>
            )}
          </div>
        </div>
        {!selectedSemesterKey && currentSgpa === null && (
            <p className="text-center text-sm text-muted-foreground">
                Select a semester to view or calculate SGPA.
            </p>
        )}
      </CardContent>
    </Card>
  );
}
