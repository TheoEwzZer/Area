export {};

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
