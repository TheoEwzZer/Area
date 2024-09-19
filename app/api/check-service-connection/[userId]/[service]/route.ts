import { db } from "@/lib/db";
import { Service, ServiceType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { userId: string; service: string } }
): Promise<
  | NextResponse<{
      detail: string;
    }>
  | NextResponse<{
      connected: boolean;
    }>
> {
  if (!params || !params.userId || !params.service) {
    return NextResponse.json(
      { detail: "Missing userId or service in route parameters" },
      { status: 400 }
    );
  }

  try {
    const userService: Service | null = await db.service.findFirst({
      where: {
        userId: params.userId,
        service: params.service as ServiceType,
      },
    });

    return NextResponse.json({ connected: !!userService });
  } catch (error) {
    console.error("Error in GET function:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
