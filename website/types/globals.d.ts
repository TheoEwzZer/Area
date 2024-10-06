import { Action, Area, Reaction, ServiceInfo } from "@prisma/client";

export type Roles = "admin" | "user";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}

export interface Option {
  value: string;
  label: string;
}

export interface AreaWithDetails extends Area {
  action: Action & {
    serviceInfo: ServiceInfo;
  };
  reaction: Reaction & {
    serviceInfo: ServiceInfo;
  };
}
