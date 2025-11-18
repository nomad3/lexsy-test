export enum UserRole {
  LAWYER = 'lawyer',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organization?: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress: string;
  userAgent: string;
}
