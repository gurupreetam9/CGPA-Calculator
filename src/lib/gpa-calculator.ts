import type { Course, SemesterDetails } from '@/types';

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
