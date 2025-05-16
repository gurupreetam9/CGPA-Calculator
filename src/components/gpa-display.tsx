
"use client";

import { Calculator, TrendingUp, MessageSquareHeart, Info, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

const chartConfig = {
  cgpa: {
    label: "CGPA",
    color: "hsl(var(--chart-1))",
  },
  remaining: {
    label: "Remaining",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig;


export function GpaDisplay({ currentSgpa, overallCgpa, selectedSemesterKey, isLoading = false }: GpaDisplayProps) {
  const sgpaText = currentSgpa !== null ? currentSgpa.toFixed(2) : "N/A";
  const cgpaText = overallCgpa !== null ? overallCgpa.toFixed(2) : "N/A";

  const currentSgpaPercentage = currentSgpa !== null ? parseFloat((currentSgpa * 10).toFixed(1)) : null;
  const sgpaPercentageText = currentSgpaPercentage !== null ? `${currentSgpaPercentage}%` : "N/A";
  
  const currentCgpaPercentage = overallCgpa !== null ? parseFloat((overallCgpa * 10).toFixed(1)) : null;
  const cgpaPercentageText = currentCgpaPercentage !== null ? `${currentCgpaPercentage}%` : "N/A";

  const { message: motivationalMessage, icon: MotivationalIcon, colorClass: motivationalColorClass } = getMotivationalMessage(currentSgpaPercentage);

  const cgpaChartData = overallCgpa !== null ? [
      { name: 'cgpa', value: overallCgpa, fill: 'var(--color-cgpa)' },
      { name: 'remaining', value: Math.max(0, 10 - overallCgpa), fill: 'var(--color-remaining)' },
    ] : [];

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Calculator className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl font-semibold">GPA Overview</CardTitle>
            <CardDescription>Your semester and overall performance.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
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
              <p className="text-sm font-medium text-muted-foreground">SGPA Percentage</p>
               {isLoading && !currentSgpaPercentage ? (
                <Skeleton className="h-10 w-24 mt-1 mx-auto" />
              ) : (
                <p className="text-3xl font-extrabold text-primary">{sgpaPercentageText}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/30 items-center">
            <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Overall CGPA</p>
                {isLoading && !overallCgpa ? (
                  <Skeleton className="h-10 w-24 mt-1 mx-auto" />
                ) : (
                <p className="text-3xl font-extrabold text-accent-foreground">{cgpaText}</p>
                )}
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">CGPA Percentage</p>
                {isLoading && !currentCgpaPercentage ? (
                  <Skeleton className="h-10 w-24 mt-1 mx-auto" />
                ) : (
                <p className="text-3xl font-extrabold text-accent-foreground">{cgpaPercentageText}</p>
                )}
            </div>
          </div>
        </div>
        
        {!selectedSemesterKey && currentSgpa === null && (
            <p className="text-center text-sm text-muted-foreground pt-2">
                Select a semester to view its SGPA and percentage.
            </p>
        )}

        <div className={`flex items-center justify-center gap-2 p-3 rounded-md border bg-card shadow-sm ${currentSgpaPercentage === null || currentSgpaPercentage === 0 ? 'border-muted' : 'border-transparent'}`}>
          <MotivationalIcon className={`h-5 w-5 ${motivationalColorClass}`} />
          <p className={`text-sm font-medium ${motivationalColorClass}`}>{motivationalMessage}</p>
        </div>

        {overallCgpa !== null && cgpaChartData.length > 0 && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-center mb-2 flex items-center justify-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Overall CGPA Breakdown
            </h3>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px] w-full max-w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                                indicator="dot" 
                                hideLabel 
                                formatter={(value, name) => (
                                  <div className="flex flex-col">
                                    <span className="capitalize font-medium">{chartConfig[name as keyof typeof chartConfig]?.label || name}</span>
                                    <span>{value.toFixed(2)}</span>
                                  </div>
                                )}
                              />}
                  />
                  <Pie
                    data={cgpaChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    strokeWidth={2}
                    paddingAngle={2}
                  >
                    {cgpaChartData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.fill} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
             <p className="text-xs text-muted-foreground text-center mt-2">
              Visualizing your CGPA ({cgpaText}) out of 10.
            </p>
          </div>
        )}
         {isLoading && overallCgpa === null && (
          <div className="mt-6 border-t pt-6 text-center">
            <Skeleton className="h-6 w-1/2 mx-auto mb-2" /> {/* Placeholder for title */}
            <Skeleton className="mx-auto h-[200px] w-[200px] rounded-full" /> {/* Placeholder for chart */}
            <Skeleton className="h-4 w-3/4 mx-auto mt-2" /> {/* Placeholder for description */}
          </div>
        )}


      </CardContent>
    </Card>
  );
}

