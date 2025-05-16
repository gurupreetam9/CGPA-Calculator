
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Course, SemesterDetails } from "@/types";
import { AppHeader } from "@/components/layout/header";
import { SemesterSelector } from "@/components/semester-selector";
import { CourseInputForm } from "@/components/course-input-form";
import { CourseListTable } from "@/components/course-list-table";
import { GpaDisplay } from "@/components/gpa-display";
import { CgpaHistoryTable } from "@/components/cgpa-history-table";
// import { ManualSgpaForm } from "@/components/manual-sgpa-form"; // Removed import
import { calculateSGPA, calculateCGPA, formatSemesterKey } from "@/lib/gpa-calculator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, BookOpenCheck, BookMarked } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

const defaultCoursesBySemester: Record<string,Omit<Course, 'id' | 'gradePoint'>[]> = {
  Y1S1: [
    { name: "Communicative English", credits: 3 },
    { name: "Mathematics – I", credits: 3 },
    { name: "Applied Chemistry", credits: 3 },
    { name: "Programming for Problem Solving using C", credits: 3 },
    { name: "Computer Engineering Workshop", credits: 3 },
    { name: "English Communication Skills Laboratory", credits: 1.5 },
    { name: "Applied Chemistry Lab", credits: 1.5 },
    { name: "Programming for Problem Solving using C Lab", credits: 1.5 },
    { name: "Environmental Science*", credits: 0 },
  ],
  Y1S2:[
    { name: "Mathematics – II", credits: 3 },
    { name: "Applied Physics", credits: 3 },
    { name: "Digital Logic Design", credits: 3 },
    { name: "Python Programming", credits: 3 },
    { name: "Data Structures", credits: 3 },
    { name: "Applied Physics Lab", credits: 1.5 },
    { name: "Python Programming Lab", credits: 1.5 },
    { name: "Data Structures Lab", credits: 1.5 },
    { name: "Constitution of India", credits: 0 },
  ],
  Y2S1:[
    { name: "Mathematics III", credits: 3 },
    { name: "Mathematical Foundations of Computer Science", credits: 3 },
    { name: "Introduction to Artificial Intelligence and Machine Learning", credits: 3 },
    { name: "Object Oriented Programming with Java", credits: 3 },
    { name: "Database Management Systems", credits: 3 },
    { name: "Introduction to Artificial Intelligence and Machine Learning Lab", credits: 1.5 },
    { name: "Object Oriented Programming with Java Lab", credits: 1.5 },
    { name: "Database Management Systems Lab", credits: 1.5 },
    { name: "Mobile App Development", credits: 2 },
    { name: "Essence of Indian Traditional Knowledge", credits: 0 },
  ],
  Y2S2:[
    { name: "Probability and Statistics", credits: 3 },
    { name: "Computer Organization", credits: 3 },
    { name: "Data Warehousing and Mining", credits: 3 },
    { name: "Formal Languages and Automata Theory", credits: 3 },
    { name: "Managerial Economics and Financial Accountancy", credits: 3 },
    { name: "R Programming Lab", credits: 1.5 },
    { name: "Data Mining using Python Lab", credits: 1.5 },
    { name: "Web Application Development Lab", credits: 1.5 },
    { name: "Natural Language Processing with Python", credits: 2 },
  ],
  Y3S1:[
    {name:"Compiler Design",credits:3},
    {name:"Operating Systems",credits:3},
    {name:"Machine Learning",credits:3},
    {name:"Open Elective-I",credits:3},
    {name:"Professional Elective-I",credits:3},
    {name:"Operating Systems & Compiler Design Lab",credits:1.5},
    {name:"Machine Learning Lab",credits:1.5},
    {name:"CI-CD using DevOps",credits:2},
    {name:"Employability Skills-I",credits:0},
    {name:"Summer Internship",credits:1.5}
  ],
  Y3S2:[
    {name:"Computer Networks",credits:3},
    {name:"Deep Learning",credits:3},
    {name:"Design and Analysis of Algorithms",credits:3},
    {name:"Professional Elective-II",credits:3},
    {name:"Open Elective-II",credits:3},
    {name:"Computer Networks Lab",credits:1.5},
    {name:"Algorithms for Efficient Coding Lab",credits:1.5},
    {name:"Deep Learning with Tensorflow",credits:1.5},
    {name:"Skill Oriented Course - IV",credits:2},
    {name:"Employability skills-II",credits:0}
  ],
  Y4S1:[
    {name:"Professional  Elective-III",credits:3},
    {name:"Professional  Elective-IV",credits:3},
    {name:"Professional  Elective-V",credits:3},
    {name:"Open Elective-III",credits:3},
    {name:"Open Elective-IV",credits:3},
    {name:"Universal Human Values 2: Understanding Harmony",credits:3},
    {name:"Skill Oriented Course",credits:2},
    {name:"Industrial/Research Internship",credits:3},
  ]
};

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
    const defaultCoursesList = defaultCoursesBySemester[semesterKey] || [];
    const semesterExists = !!semestersData[semesterKey];

    const shouldInitializeCourses = !semesterExists ||
      (!semestersData[semesterKey].isManual &&
        (!semestersData[semesterKey].courses || semestersData[semesterKey].courses.length === 0));

    if (shouldInitializeCourses) {
      const newCoursesWithDefaults: Course[] = defaultCoursesList.map((course, index) => ({
        ...course,
        id: `${semesterKey}-${course.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`,
        gradePoint: 0,
      }));

      const newTotalCredits = newCoursesWithDefaults.reduce((sum, c) => sum + c.credits, 0);
      const newSgpa = calculateSGPA(newCoursesWithDefaults);

      setSemestersData(prev => ({
        ...prev,
        [semesterKey]: {
          ...(prev[semesterKey] || {}),
          id: semesterKey,
          year,
          semesterInYear,
          courses: newCoursesWithDefaults,
          sgpa: newSgpa,
          totalCredits: newTotalCredits,
          isManual: false,
        },
      }));
    }
  };

  const handleAddCourse = (newCourseData: Omit<Course, 'id'>) => {
    if (!selectedSemesterKey) return;

    const newCourse: Course = {
        ...newCourseData, // This now includes gradePoint converted from letterGrade
        id: `${selectedSemesterKey}-${newCourseData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`
    };

    setSemestersData(prev => {
      const updatedSemester = { ...prev[selectedSemesterKey] };
      updatedSemester.courses = [...updatedSemester.courses, newCourse];
      updatedSemester.totalCredits = updatedSemester.courses.reduce((sum, c) => sum + c.credits, 0);
      updatedSemester.sgpa = calculateSGPA(updatedSemester.courses);
      updatedSemester.isManual = false; // Ensure new courses make semester not manual
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
      return { ...prev, [selectedSemesterKey]: updatedSemester };
    });
    toast({ title: "Course Deleted", description: "The course has been removed."});
  };

  const handleUpdateCourseGrade = (courseId: string, newGradePoint: number) => { // Receives numeric gradePoint
    if (!selectedSemesterKey) return;
    // Basic validation still good, though selection limits direct user error
    if (isNaN(newGradePoint) || newGradePoint < 0 || newGradePoint > 10) {
        // This case should be rare now due to Select component
        toast({
            title: "Invalid Grade Data",
            description: "An issue occurred while updating the grade.",
            variant: "destructive",
        });
        return;
    }

    setSemestersData(prev => {
      const currentSemester = prev[selectedSemesterKey];
      if (!currentSemester) return prev;

      const updatedCourses = currentSemester.courses.map(c =>
        c.id === courseId ? { ...c, gradePoint: newGradePoint } : c
      );

      const updatedSemester = {
        ...currentSemester,
        courses: updatedCourses,
        sgpa: calculateSGPA(updatedCourses),
      };

      return { ...prev, [selectedSemesterKey]: updatedSemester };
    });
  };

  // const handleAddManualSgpa = (year: number, semesterInYear: number, sgpa: number, totalCredits: number) => { // Removed function
  //   const semesterKey = `Y${year}S${semesterInYear}`;
  //   setSemestersData(prev => ({
  //     ...prev,
  //     [semesterKey]: {
  //       id: semesterKey,
  //       year,
  //       semesterInYear,
  //       courses: [],
  //       sgpa,
  //       totalCredits,
  //       isManual: true,
  //     },
  //   }));
  // };

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
            <BookMarked className="h-16 w-16 text-primary animate-pulse" />
            <p className="text-muted-foreground mt-4">Loading Guru...</p>
        </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-8 space-y-8">
        <section aria-labelledby="semester-selection-title">
            <SemesterSelector
            selectedSemesterKey={selectedSemesterKey}
            onSelectSemester={handleSelectSemester}
            />
        </section>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-6">
            {selectedSemesterKey && currentSemesterDetails && !currentSemesterDetails.isManual && (
              <Card className="shadow-xl">
                <CardHeader>
                   <div className="flex items-center gap-3">
                    <BookMarked className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle id="course-management-title" className="text-2xl font-semibold">Courses for {formatSemesterKey(selectedSemesterKey)}</CardTitle>
                        <CardDescription>Manage courses for the selected semester. Update grades in the table or add new courses below.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CourseListTable
                    courses={currentSemesterDetails.courses || []}
                    onDeleteCourse={handleDeleteCourse}
                    onUpdateCourseGrade={handleUpdateCourseGrade}
                  />
                  <Separator />
                  <CourseInputForm onAddCourse={handleAddCourse} />
                </CardContent>
              </Card>
            )}

            {selectedSemesterKey && currentSemesterDetails && currentSemesterDetails.isManual && (
                <Alert variant="default" className="border-accent bg-accent/10 text-accent-foreground shadow-lg">
                    <AlertCircle className="h-5 w-5 text-accent" />
                    <AlertTitle className="font-semibold">Manual Entry Active</AlertTitle>
                    <AlertDescription>
                    SGPA for {formatSemesterKey(selectedSemesterKey)} was entered manually.
                    Course list is disabled for this semester.
                    </AlertDescription>
                </Alert>
            )}
            {!selectedSemesterKey && (
                 <Card className="shadow-xl">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <BookOpenCheck className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle className="text-2xl font-semibold">Course Management</CardTitle>
                                <CardDescription>Select a semester above to manage courses and view SGPA.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-10 text-muted-foreground">
                            <BookOpenCheck className="mx-auto h-12 w-12 mb-3 text-primary/70" />
                            <p className="text-lg">No semester selected.</p>
                            <p className="text-sm">Your courses and SGPA for the selected semester will appear here.</p>
                        </div>
                    </CardContent>
                 </Card>
            )}
          </div>
          <div className="md:col-span-1 space-y-6">
            <GpaDisplay
            currentSgpa={currentSgpa}
            overallCgpa={overallCgpa}
            selectedSemesterKey={selectedSemesterKey}
            isLoading={isLoading && !selectedSemesterKey}
            />
          </div>
        </div>

        <section aria-labelledby="additional-tools-title" className="pt-4">
             <CgpaHistoryTable semestersData={semestersData} />
             {/* ManualSgpaForm was here */}
        </section>

      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} Guru. All rights reserved.
      </footer>
    </div>
  );
}
