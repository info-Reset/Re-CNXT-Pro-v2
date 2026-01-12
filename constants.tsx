
import { Client, ClientStatus, ProjectStatus } from './types';

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    company: 'EcoStyle Boutique',
    email: 'sarah@ecostyle.com',
    phone: '+1 (555) 123-4567',
    status: ClientStatus.ACTIVE,
    totalRevenue: 15000,
    notes: 'Very interested in organic SEO. Prefers communication via email.',
    createdAt: '2023-10-15',
    projects: [
      {
        id: 'p1',
        name: 'E-commerce Redesign',
        type: 'Website',
        status: ProjectStatus.IN_PROGRESS,
        progress: 65,
        startDate: '2024-01-10',
        driveLink: 'https://docs.google.com/folder/1',
        tasks: [
          { id: 't1', title: 'Product page layout', completed: true },
          { id: 't2', title: 'Payment gateway integration', completed: false }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Mark Thompson',
    company: 'Apex Logistics',
    email: 'mark@apex.logistics',
    phone: '+1 (555) 987-6543',
    status: ClientStatus.LEAD,
    totalRevenue: 0,
    notes: 'Needs a new brand identity and landing page.',
    createdAt: '2024-03-01',
    projects: []
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    company: 'Urban Greens',
    email: 'elena@urbangreens.io',
    phone: '+1 (555) 444-5555',
    status: ClientStatus.POTENTIAL,
    totalRevenue: 8500,
    notes: 'Retainer client for social media marketing.',
    createdAt: '2023-12-05',
    projects: [
      {
        id: 'p2',
        name: 'Q2 Social Campaign',
        type: 'Marketing',
        status: ProjectStatus.PLANNING,
        progress: 10,
        startDate: '2024-03-15',
        sheetLink: 'https://docs.google.com/spreadsheets/1',
        tasks: [
          { id: 't3', title: 'Creative Assets', completed: false }
        ]
      }
    ]
  }
];

export const COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};
