"use client";

import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SemesterSelectorProps extends HTMLAttributes<HTMLDivElement> {
  selectedSemesterKey: string | null;
  onSelectSemester: (semesterKey: string, year: number, semesterInYear: number) => void;
  years?: number[];
  semestersInYear?: number[];
}

const defaultYears = [1, 2, 3, 4];
const defaultSemestersInYear = [1, 2];

export function SemesterSelector({
  selectedSemesterKey,
  onSelectSemester,
  years = defaultYears,
  semestersInYear = defaultSemestersInYear,
  className,
  ...props
}: SemesterSelectorProps) {
  return (
    <Card className={cn("shadow-lg", className)} {...props}>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Select Semester</CardTitle>
        <CardDescription>Choose a year and semester to manage courses and view GPA.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {years.map((year) => (
            <div key={year} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground text-center sm:text-left">Year {year}</h3>
              <div className="grid grid-cols-2 gap-2">
                {semestersInYear.map((semester) => {
                  const semesterKey = `Y${year}S${semester}`;
                  const isSelected = selectedSemesterKey === semesterKey;
                  return (
                    <Button
                      key={semesterKey}
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={() => onSelectSemester(semesterKey, year, semester)}
                      className={cn(
                        "w-full transition-all duration-150 ease-in-out transform hover:scale-105",
                        isSelected && "ring-2 ring-primary ring-offset-2 shadow-md"
                      )}
                      aria-pressed={isSelected}
                    >
                      Sem {semester}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
