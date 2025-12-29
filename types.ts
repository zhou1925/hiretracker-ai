
export enum JobStatus {
  WISHLIST = 'Wishlist',
  APPLIED = 'Applied',
  INTERVIEWING = 'Interviewing',
  OFFER = 'Offer',
  REJECTED = 'Rejected',
  GHOSTED = 'Ghosted'
}

export type Theme = 'light' | 'dark' | 'indigo' | 'sage' | 'sunset';

export interface ActivityLog {
  id: string;
  timestamp: number;
  note: string;
  type: 'status_change' | 'manual_note';
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  url: string;
  status: JobStatus;
  appliedDate: string;
  importantDates: { label: string; date: string }[];
  notes: string;
  salary: string;
  location: string;
  lastUpdated: number;
  activityLog: ActivityLog[];
}

export interface AIAnalysis {
  summary: string;
  interviewTips: string[];
  followUpDraft: string;
  matchScore?: number;
  missingKeywords?: string[];
}

export interface UserProfile {
  name: string;
  masterResume: string;
  theme: Theme;
}
