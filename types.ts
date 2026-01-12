
export enum ProjectStatus {
  PLANNING = 'Planning',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'In Review',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold'
}

export enum ClientStatus {
  LEAD = 'Fresh Start',
  ACTIVE = 'In Motion',
  POTENTIAL = 'On Deck',
  CHURNED = 'Concluded'
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface CreativeMockup {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  type: 'Website' | 'Marketing' | 'SEO' | 'PPC';
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate?: string;
  externalLink?: string; 
  driveLink?: string;
  sheetLink?: string;
  tasks: Task[];
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: ClientStatus;
  totalRevenue: number;
  notes: string;
  projects: Project[];
  createdAt: string;
  mockups?: CreativeMockup[]; // New field for AI generated concepts
}

export interface Prospect {
  name: string;
  address: string;
  website?: string;
  rating?: number;
  mapsUri?: string;
}

export interface AgencyProfile {
  name: string;
  website: string;
  plan: 'Basic' | 'Pro' | 'Enterprise';
  lastBackup: string | null;
}

export interface WorkspaceConfig {
  spreadsheetId: string;
  rootFolderId: string;
  isConnected: boolean;
  lastSync: string | null;
  userEmail: string | null;
}
