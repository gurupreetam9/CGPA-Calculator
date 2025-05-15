"use client";

import { useState, useEffect, useMemo } from "react";
import type { Course, SemesterDetails } from "@/types";
import { AppHeader } from "@/components/layout/header";
import { SemesterSelector } from "@/components/semester-selector";
import { CourseInputForm } from "@/components/course-input-form";
import { CourseListTable } from "@/components/course-list-table";
import { GpaDisplay } from "@/components/gpa-display";
import { CgpaHistoryTable } from "@/components/cgpa-history-table";
import { ManualSgpaForm } from "@/components/manual-sgpa-form";
import { calculateSGPA, calculateCGPA, formatSemesterKey } from "@/lib/gpa-calculator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, BookOpenCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

export default function HomePage() {
  const [semestersData, setSemestersData] = useState<Record<string, SemesterDetails>>({});
  const [selectedSemesterKey, setSelectedSemesterKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For initial load from localStorage

  // Load data from localStorage on initial mount
  useEffect(() => {
    try {
      const storedSemesters = localStorage.getItem("guruSemesters");
      const storedSelectedSemester = localStorage.getItem("guruSelectedSemester");
      if (storedSemesters) {
        setSemestersData(JSON.parse(storedSemesters));
      }
      if (storedSelectedSemester) {
        setSelectedSemesterKey(JSON.parse(storedSelectedSemester));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({ title: "Error", description: "Could not load saved data.", variant: "destructive"});
    }
    setIsLoading(false);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) { // Only save after initial load
        try {
            localStorage.setItem("guruSemesters", JSON.stringify(semestersData));
            if (selectedSemesterKey) {
                localStorage.setItem("guruSelectedSemester", JSON.stringify(selectedSemesterKey));
            } else {
                localStorage.removeItem("guruSelectedSemester");
            }
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
            toast({ title: "Error", description: "Could not save data. Storage might be full.", variant: "destructive"});
        }
    }
  }, [semestersData, selectedSemesterKey, isLoading]);


  const handleSelectSemester = (semesterKey: string, year: number, semesterInYear: number) => {
    setSelectedSemesterKey(semesterKey);
    if (!semestersData[semesterKey]) {
      setSemestersData(prev => ({
        ...prev,
        [semesterKey]: {
          id: semesterKey,
          year,
          semesterInYear,
          courses: [],
          sgpa: null,
          totalCredits: 0,
          isManual: false,
        },
      }));
    }
  };

  const handleAddCourse = (newCourseData: Omit<Course, 'id'>) => {
    if (!selectedSemesterKey) return;

    const newCourse: Course = { ...newCourseData, id: Date.now().toString() };
    
    setSemestersData(prev => {
      const updatedSemester = { ...prev[selectedSemesterKey] };
      updatedSemester.courses = [...updatedSemester.courses, newCourse];
      updatedSemester.totalCredits = updatedSemester.courses.reduce((sum, c) => sum + c.credits, 0);
      updatedSemester.sgpa = calculateSGPA(updatedSemester.courses);
      updatedSemester.isManual = false; // Adding courses means it's no longer manual
      return { ...prev, [selectedSemesterKey]: updatedSemester };
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    if (!selectedSemesterKey) return;

    setSemestersData(prev => {
      const updatedSemester = { ...prev[selectedSemesterKey] };
      updatedSemester.courses = updatedSemester.courses.filter(c => c.id !== courseId);
      updatedSemester.totalCredits = updatedSemester.courses.reduce((sum, c) => sum + c.credits, 0);
      updatedSemester.sgpa = calculateSGPA(updatedSemester.courses);
      // isManual status remains false or whatever it was, deleting course doesn't make it manual
      return { ...prev, [selectedSemesterKey]: updatedSemester };
    });
    toast({ title: "Course Deleted", description: "The course has been removed."});
  };

  const handleAddManualSgpa = (year: number, semesterInYear: number, sgpa: number, totalCredits: number) => {
    const semesterKey = `Y${year}S${semesterInYear}`;
    setSemestersData(prev => ({
      ...prev,
      [semesterKey]: {
        id: semesterKey,
        year,
        semesterInYear,
        courses: [], // Manual entry overrides courses for GPA calc
        sgpa,
        totalCredits,
        isManual: true,
      },
    }));
  };

  const currentSemesterDetails = selectedSemesterKey ? semestersData[selectedSemesterKey] : null;
  
  const currentSgpa = useMemo(() => {
    if (currentSemesterDetails) {
        return currentSemesterDetails.sgpa;
    }
    return null;
  }, [currentSemesterDetails]);

  const overallCgpa = useMemo(() => calculateCGPA(semestersData), [semestersData]);

  if (isLoading) {
      return (
        <div className="flex flex-col min-h-screen items-center justify-center">
            <BookOpenCheck className="h-16 w-16 text-primary animate-pulse" />
            <p className="text-muted-foreground mt-4">Loading Guru...</p>
        </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-6 space-y-6">
        <SemesterSelector
          selectedSemesterKey={selectedSemesterKey}
          onSelectSemester={handleSelectSemester}
        />

        <GpaDisplay
          currentSgpa={currentSgpa}
          overallCgpa={overallCgpa}
          selectedSemesterKey={selectedSemesterKey}
        />

        {selectedSemesterKey && currentSemesterDetails && !currentSemesterDetails.isManual && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Courses for {formatSemesterKey(selectedSemesterKey)}</CardTitle>
              <CardDescription>Add or manage courses for the selected semester.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CourseInputForm onAddCourse={handleAddCourse} />
              <Separator />
              <CourseListTable
                courses={currentSemesterDetails.courses || []}
                onDeleteCourse={handleDeleteCourse}
              />
            </CardContent>
          </Card>
        )}

        {selectedSemesterKey && currentSemesterDetails && currentSemesterDetails.isManual && (
             <Alert variant="default" className="border-accent bg-accent/10 text-accent-foreground">
                <AlertCircle className="h-5 w-5 text-accent" />
                <AlertTitle className="font-semibold">Manual Entry Active</AlertTitle>
                <AlertDescription>
                SGPA for {formatSemesterKey(selectedSemesterKey)} was entered manually. 
                Course list is disabled for this semester. To add courses, clear manual entry (future feature) or select a different semester.
                </AlertDescription>
            </Alert>
        )}
        
        <div className="grid md:grid-cols-2 gap-6">
            <CgpaHistoryTable semestersData={semestersData} />
            <ManualSgpaForm 
                onAddManualSgpa={handleAddManualSgpa} 
                existingSemesterKeys={Object.keys(semestersData).filter(key => semestersData[key].isManual || (semestersData[key].courses && semestersData[key].courses.length > 0))}
            />
        </div>

      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} Guru. All rights reserved.
      </footer>
    </div>
  );
}
