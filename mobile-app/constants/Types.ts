import { ServiceType } from '@prisma/client';

export interface Block {
  type: 'action' | 'reaction';
  text: string;
  icon: string;
  service?: string;
  action?: string;
  color?: string;
}

export interface Action {
  id: number;
  name: string;
  description: string;
  serviceInfoId: number;
}

export interface Reaction {
  id: number;
  name: string;
  description: string;
  serviceInfoId: number;
}

export interface Service {
  service: ReactNode;
  id: number;
  type: string;
  color: string;
  image_url: string;
  description: string;
  actions: Action[];
  reactions: Reaction[];
}

export type TokenCache = {
  getToken: (key: string) => Promise<string | null>;
  saveToken: (key: string, value: string) => Promise<void>;
};