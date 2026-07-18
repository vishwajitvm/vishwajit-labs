// Shared Types for Vishwajit Labs

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tech: string[];
}

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  company?: string;
  job?: string;
  budget?: string;
}

export interface SystemMetrics {
  visitors: number;
  downloads: number;
  messages: number;
  aiChats: number;
}
