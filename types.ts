export interface Subscription {
  startDate: string; // ISO string
  endDate: string;   // ISO string
}

export type SubscriptionType = 'monthly' | 'annual' | 'trial';

export interface Client {
  id: string;
  name: string;
  surname: string;
  companyName?: string;
  vatNumber?: string;
  address: string;
  email: string;
  iban: string;
  otherInfo: string;
  subscription: Subscription;
  subscriptionType: SubscriptionType;
  productId?: string;
  sellerId?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface Seller {
  id: string;
  name: string;
  commissionRate: number; // Percentage
}

export type ProjectStatus = 'planning' | 'active' | 'completed' | 'on_hold';

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
}

export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
}