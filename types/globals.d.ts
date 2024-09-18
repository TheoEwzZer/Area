export {};

export type Roles = "admin" | "client";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
