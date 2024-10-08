import {
  Action,
  Area,
  Reaction,
  ReactionData,
  ServiceInfo,
} from "@prisma/client";

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
  reactions: (Reaction & {
    serviceInfo: ServiceInfo;
    reactionData: ReactionData;
  })[];
}
