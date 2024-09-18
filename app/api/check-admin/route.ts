import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<{
  isAdmin: boolean;
}>> {
  const { sessionClaims } = auth();

  if (sessionClaims?.metadata.role === "admin") {
    return NextResponse.json({ isAdmin: true });
  } else {
    return NextResponse.json({ isAdmin: false });
  }
}
