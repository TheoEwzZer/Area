import { auth } from "@clerk/nextjs/server";

export const isAdmin: () => boolean = (): boolean => {
  const { sessionClaims } = auth();

  return sessionClaims?.metadata.role === "admin";
};
