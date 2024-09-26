import { db } from "@/lib/db";
import { Service } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { userId: string } }
): Promise<
  | NextResponse<{
      detail: string;
    }>
  | NextResponse<{
      services: Service[];
    }>
> {
  if (!params || !params.userId) {
    return NextResponse.json(
      { detail: "Missing userId in route parameters" },
      { status: 400 }
    );
  }

  try {
    const userServices: Service[] = await db.service.findMany({
      where: {
        userId: params.userId,
      },
    });

    return NextResponse.json({ services: userServices });
  } catch (error) {
    console.error("Error in GET function:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
