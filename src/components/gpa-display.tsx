
"use client";

import { Calculator, TrendingUp, MessageSquareHeart, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface GpaDisplayProps {
  currentSgpa: number | null;
  overallCgpa: number | null;
  selectedSemesterKey: string | null;
  isLoading?: boolean;
}

const getMotivationalMessage = (percentage: number | null): { message: string; icon: React.ElementType, colorClass: string } => {
  if (percentage === null || percentage === 0) {
    return { message: "Enter grades to see your performance!", icon: Info, colorClass: "text-muted-foreground" };
  }
  if (percentage >= 90) {
    return { message: "Congrats Topper! 🎉 Outstanding Performance!", icon: TrendingUp, colorClass: "text-green-500 dark:text-green-400" };
  }
  if (percentage >= 80) {
    return { message: "Way to Go! 👍 Excellent Work!", icon: TrendingUp, colorClass: "text-blue-500 dark:text-blue-400" };
  }
  if (percentage >= 70) {
    return { message: "Great Job! 😊 Keep it Up!", icon: MessageSquareHeart, colorClass: "text-sky-500 dark:text-sky-400" };
  }
  if (percentage >= 60) {
    return { message: "Good Effort! 💪 You're Doing Well!", icon: MessageSquareHeart, colorClass: "text-yellow-500 dark:text-yellow-400" };
  }
  if (percentage >= 50) {
    return { message: "Making Progress! 🌱 Keep Pushing!", icon: MessageSquareHeart, colorClass: "text-orange-500 dark:text-orange-400" };
  }
  return { message: "Stay Focused! 🎯 Every Step Counts!", icon: MessageSquareHeart, colorClass: "text-red-500 dark:text-red-400" };
};

export function GpaDisplay({ currentSgpa, overallCgpa, selectedSemesterKey, isLoading = false }: GpaDisplayProps) {
  const sgpaText = currentSgpa !== null ? currentSgpa.toFixed(2) : "N/A";
  const cgpaText = overallCgpa !== null ? overallCgpa.toFixed(2) : "N/A";

  const currentPercentage = currentSgpa !== null ? parseFloat((currentSgpa * 10).toFixed(1)) : null;
  const percentageText = currentPercentage !== null ? `${currentPercentage}%` : "N/A";
  
  const { message: motivationalMessage, icon: MotivationalIcon, colorClass: motivationalColorClass } = getMotivationalMessage(currentPercentage);

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Calculator className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl font-semibold">GPA Overview</CardTitle>
            <CardDescription>Your semester performance and overall CGPA.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/30 items-center">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {selectedSemesterKey ? `Current SGPA` : "SGPA"}
            </p>
            {isLoading && !currentSgpa ? (
              <Skeleton className="h-10 w-24 mt-1 mx-auto" />
            ) : (
              <p className="text-3xl font-extrabold text-primary">{sgpaText}</p>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Percentage</p>
             {isLoading && !currentPercentage ? (
              <Skeleton className="h-10 w-24 mt-1 mx-auto" />
            ) : (
              <p className="text-3xl font-extrabold text-primary">{percentageText}</p>
            )}
          </div>
        </div>

        <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Overall CGPA</p>
            {isLoading && !overallCgpa ? (
              <Skeleton className="h-10 w-24 mt-1 mx-auto" />
            ) : (
            <p className="text-3xl font-extrabold text-accent-foreground">{cgpaText}</p>
            )}
        </div>
        
        {!selectedSemesterKey && currentSgpa === null && (
            <p className="text-center text-sm text-muted-foreground pt-2">
                Select a semester to view its SGPA and percentage.
            </p>
        )}

        <div className={`flex items-center justify-center gap-2 p-3 rounded-md border bg-card shadow-sm ${currentPercentage === null || currentPercentage === 0 ? 'border-muted' : 'border-transparent'}`}>
          <MotivationalIcon className={`h-5 w-5 ${motivationalColorClass}`} />
          <p className={`text-sm font-medium ${motivationalColorClass}`}>{motivationalMessage}</p>
        </div>

      </CardContent>
    </Card>
  );
}
