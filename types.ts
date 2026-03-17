
export type PaymentMethod = string;

export interface ServiceRecord {
  id: string;
  clientName: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  date: string; // ISO string
  ownerEmail?: string; // E-mail de quem realizou o serviço
}

export interface User {
  id: string;
  username: string;
  isAuthenticated: boolean;
  isAdmin?: boolean;
}

export interface MonthlyGroup {
  monthYear: string;
  services: ServiceRecord[];
  totalValue: number;
}

export interface BackupData {
  services: ServiceRecord[];
  version: string;
  exportDate: string;
  sourceUser: string;
}
