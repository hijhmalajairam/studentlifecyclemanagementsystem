// Application & Admission Statuses
export const APPLICATION_STATUSES = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  INTERVIEW_PASSED: 'INTERVIEW_PASSED',
  INTERVIEW_FAILED: 'INTERVIEW_FAILED',
  SELECTED: 'SELECTED',
  REJECTED: 'REJECTED',
  FEE_PENDING: 'FEE_PENDING',
  ENROLLED: 'ENROLLED',
} as const;

// Document Verification Statuses
export const DOCUMENT_STATUSES = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  FORGED: 'FORGED',
} as const;

// Academic Statuses
export const ACADEMIC_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
} as const;

// Fee Statuses
export const FEE_STATUSES = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
} as const;

// Internship Statuses
export const INTERNSHIP_STATUSES = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  PENDING: 'PENDING',
  CHANGES_REQUIRED: 'CHANGES_REQUIRED',
  RESUBMITTED: 'RESUBMITTED',
  APPROVED: 'APPROVED',
  ASSIGNED: 'ASSIGNED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  WAIVED: 'WAIVED',
} as const;

// User Roles
export const USER_ROLES = {
  PROSPECTIVE_STUDENT: 'PROSPECTIVE_STUDENT',
  STUDENT: 'STUDENT',
  FACULTY: 'FACULTY',
  ADMIN: 'ADMIN',
  PARENT: 'PARENT',
  HOD: 'HOD',
  COMMITTEE: 'COMMITTEE',
  INTERVIEWER: 'INTERVIEWER',
} as const;

// Faculty Administrative Roles
export const ADMIN_ROLES = [
  'None',
  'Head of Department',
  'Dean',
  'Exam Controller',
  'Warden',
  'Hostel Warden',
  'Mess Incharge',
  'Finance Officer',
  'Placement Coordinator',
  'Lab In-charge',
  'Sports Coordinator',
  'Cultural Coordinator',
  'Library Incharge',
  'Transport Incharge',
  'Disciplinary Committee Head',
  'Interviewer / Document Verifier',
] as const;

// Faculty Designations
export const FACULTY_DESIGNATIONS = [
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Lecturer',
  'Senior Lecturer',
  'Guest Faculty',
  'Dean',
] as const;

// Employment Types
export const EMPLOYMENT_TYPES = [
  'Permanent',
  'Contract',
  'Visiting',
  'Guest',
  'Adjunct',
] as const;

// Faculty Status Options
export const FACULTY_STATUS_OPTIONS = [
  'Active',
  'On Leave',
  'Sabbatical',
  'Resigned',
  'Retired',
] as const;

// Letter Grades (10-point scale)
export const LETTER_GRADES = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'] as const;

export const GRADE_POINTS: Record<string, number> = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0,
};

// Days of the Week
export const DAYS_OF_WEEK = [
  { value: 'MON', label: 'Monday' },
  { value: 'TUE', label: 'Tuesday' },
  { value: 'WED', label: 'Wednesday' },
  { value: 'THU', label: 'Thursday' },
  { value: 'FRI', label: 'Friday' },
  { value: 'SAT', label: 'Saturday' },
] as const;

// Student Demographics
export const GENDERS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
] as const;

export const CATEGORIES = [
  { value: 'GEN', label: 'General' },
  { value: 'SC', label: 'SC' },
  { value: 'ST', label: 'ST' },
  { value: 'OBC', label: 'OBC' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

// Work Modes (Internships)
export const WORK_MODES = [
  { value: 'ONSITE', label: 'On-site' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
] as const;

// Disciplinary Committee Decisions
export const COMMITTEE_DECISIONS = [
  { value: 'CLEARED', label: 'Cleared / No Action' },
  { value: 'MARKS_CANCELLED', label: 'Marks Cancelled / Backlog' },
  { value: 'SUSPENSION_YEAR_DROP', label: 'Suspension / Year Drop' },
] as const;

// Grievance Categories
export const GRIEVANCE_CATEGORIES = ['IT', 'Maintenance', 'Academics', 'Finance'] as const;

// Assessment Types
export const ASSESSMENT_TYPES = [
  { value: 'MID_1', label: 'Mid 1' },
  { value: 'MID_2', label: 'Mid 2' },
  { value: 'LAB_1', label: 'Lab 1' },
  { value: 'LAB_2', label: 'Lab 2' },
  { value: 'COMPRE', label: 'Compre' },
] as const;

// Entry Types for Admissions
export const ENTRY_TYPES = [
  { value: 'ONLINE', label: 'Online Regular' },
  { value: 'OFFLINE', label: 'Offline/Paper Application' },
  { value: 'LATERAL', label: 'Lateral Entry Yr2' },
  { value: 'TRANSFER', label: 'Transfer Student' },
  { value: 'DIRECT', label: 'Direct Admission' },
] as const;

// Attendance Statuses  
export const ATTENDANCE_STATUSES = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
} as const;
