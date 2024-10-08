import { currentUser, User } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(): Promise<
  | NextResponse<{
      detail: string;
    }>
  | NextResponse<User>
> {
  const user: User | null = await currentUser();

  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(user);
}
