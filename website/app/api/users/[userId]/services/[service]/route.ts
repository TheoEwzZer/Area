import { db } from "@/lib/db";
import { Prisma, Service, ServiceType } from "@prisma/client";
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string; service: string } }
): Promise<
  | NextResponse<{
      detail: string;
    }>
  | NextResponse<{
      detail: string;
    }>
> {
  if (!params || !params.userId || !params.service) {
    return NextResponse.json(
      { detail: "Missing userId or service in route parameters" },
      { status: 400 }
    );
  }

  try {
    const deletedService: Prisma.BatchPayload = await db.service.deleteMany({
      where: {
        userId: params.userId,
        service: params.service as ServiceType,
      },
    });

    if (deletedService.count === 0) {
      return NextResponse.json(
        { detail: "Service not found or already disconnected" },
        { status: 404 }
      );
    }

    return NextResponse.json({ detail: "Service disconnected successfully" });
  } catch (error) {
    console.error("Error in DELETE function:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
