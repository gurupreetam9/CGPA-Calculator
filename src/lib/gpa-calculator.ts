
import type { Course, SemesterDetails } from '@/types';

export const gradeMap: Record<string, number> = {
  "A+": 10,
  "A": 9,
  "B": 8,
  "C": 7,
  "D": 6,
  "E": 5,
  "F": 0,
};

export const letterGrades: string[] = Object.keys(gradeMap);

export function letterGradeToGradePoint(letterGrade: string): number {
  return gradeMap[letterGrade] ?? 0; // Default to 0 (F) if somehow an invalid grade is passed
}

export function gradePointToLetterGrade(gradePoint: number): string {
  // Find the closest letter grade for a given point.
  // This handles potential floating points if calculations were ever imprecise, though they shouldn't be.
  for (const grade in gradeMap) {
    if (gradeMap[grade] === gradePoint) {
      return grade;
    }
  }
  // Fallback for unexpected grade points, prefer "F" or the closest lower.
  // For simplicity, if direct match fails, default to "F".
  // A more robust solution might find the nearest valid grade.
  if (gradePoint >= 10) return "A+";
  if (gradePoint >= 9) return "A";
  if (gradePoint >= 8) return "B";
  if (gradePoint >= 7) return "C";
  if (gradePoint >= 6) return "D";
  if (gradePoint >= 5) return "E";
  return "F";
}


/**
 * Calculates SGPA for a given list of courses.
 * SGPA = Sum(course.credits * course.gradePoint) / Sum(course.credits)
 * @param courses Array of Course objects.
 * @returns Calculated SGPA, or null if no credits or courses.
 */
export function calculateSGPA(courses: Course[]): number | null {
  if (!courses || courses.length === 0) {
    return null;
  }

  let totalGradePoints = 0;
  let totalCredits = 0;

  courses.forEach(course => {
    totalGradePoints += course.credits * course.gradePoint;
    totalCredits += course.credits;
  });

  if (totalCredits === 0) {
    return null;
  }

  return parseFloat((totalGradePoints / totalCredits).toFixed(2));
}

/**
 * Calculates CGPA based on a record of all semester details.
 * CGPA = Sum(semester.sgpa * semester.totalCredits) / Sum(semester.totalCredits)
 * @param semestersData Record of SemesterDetails objects.
 * @returns Calculated CGPA, or null if no valid semester data.
 */
export function calculateCGPA(semestersData: Record<string, SemesterDetails>): number | null {
  let cumulativeGradePoints = 0;
  let cumulativeCredits = 0;

  Object.values(semestersData).forEach(semester => {
    if (semester.sgpa !== null && semester.totalCredits > 0) {
      cumulativeGradePoints += semester.sgpa * semester.totalCredits;
      cumulativeCredits += semester.totalCredits;
    }
  });

  if (cumulativeCredits === 0) {
    return null;
  }

  return parseFloat((cumulativeGradePoints / cumulativeCredits).toFixed(2));
}

/**
 * Formats a semester key (e.g., "Y1S1") into a human-readable string.
 * @param semesterKey The semester key.
 * @returns Formatted string like "Year 1, Semester 1".
 */
export function formatSemesterKey(semesterKey: string): string {
  const yearMatch = semesterKey.match(/Y(\d+)/);
  const semesterMatch = semesterKey.match(/S(\d+)/);
  if (yearMatch && semesterMatch) {
    return `Year ${yearMatch[1]}, Semester ${semesterMatch[1]}`;
  }
  return semesterKey;
}
