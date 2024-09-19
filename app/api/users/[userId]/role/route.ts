import { isAdmin } from "@/lib/is-admin";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
): Promise<
  NextResponse<{
    detail: string;
  }>
> {
  if (!isAdmin()) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const { role } = await req.json();

  if (!role) {
    return NextResponse.json({ detail: "Missing role" }, { status: 400 });
  }

  try {
    await clerkClient().users.updateUser(params.userId, {
      publicMetadata: { role },
    });
    return NextResponse.json({ detail: "Role updated successfully" });
  } catch (error) {
    console.error("Failed to update user role:", error);
    return NextResponse.json(
      { detail: "Failed to update user role" },
      { status: 500 }
    );
  }
}
