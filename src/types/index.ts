export interface Course {
  id: string;
  name: string;
  credits: number;
  gradePoint: number; // Assuming 0-10 scale, can be adapted
}

export interface SemesterDetails {
  id: string; // e.g., "Y1S1"
  year: number;
  semesterInYear: number; // 1 or 2
  courses: Course[];
  sgpa: number | null;
  totalCredits: number;
  isManual: boolean; // True if SGPA and totalCredits were manually entered
}
