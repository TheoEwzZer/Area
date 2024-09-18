import { isAdmin } from "@/lib/is-admin";
import { clerkClient, User } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<{
  detail: string;
}> | NextResponse<User[]>> {
  if (!isAdmin()) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const userList: { data: User[] } = await clerkClient().users.getUserList();

  return NextResponse.json(userList.data);
}
