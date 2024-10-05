import { db } from "@/lib/db";
import { stopWatch } from "@/lib/eventManager";
import { currentUser, User } from "@clerk/nextjs/server";
import { Action, Area, Service, ServiceInfo } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { areaId: string } }
): Promise<
  | NextResponse<{
      detail: string;
    }>
  | NextResponse<Area>
> {
  const user: User | null = await currentUser();
  const id: string = params.areaId;
  const { isActive, title } = await req.json();

  if (!user) {
    return NextResponse.json(
      { detail: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    const area: Area | null = await db.area.findUnique({
      where: { id: Number(id) },
    });

    if (!area || area.userId !== user.id) {
      return NextResponse.json(
        { detail: "Area not found or not authorized" },
        { status: 404 }
      );
    }

    const updatedArea: Area = await db.area.update({
      where: { id: Number(id) },
      data: { isActive, title },
    });

    return NextResponse.json(updatedArea);
  } catch (error) {
    console.error("Error updating area:", error);
    return NextResponse.json(
      { detail: "Failed to update area" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { areaId: string } }
): Promise<
  NextResponse<{
    detail: string;
  }>
> {
  const user: User | null = await currentUser();
  const id: string = params.areaId;

  if (!user) {
    return NextResponse.json(
      { detail: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    const area: Area | null = await db.area.findUnique({
      where: { id: Number(id) },
    });

    if (!area || area.userId !== user.id) {
      return NextResponse.json(
        { detail: "Area not found or not authorized" },
        { status: 404 }
      );
    }

    const action: (Action & { serviceInfo: ServiceInfo }) | null =
      await db.action.findFirst({
        where: {
          id: area.actionId,
        },
        include: {
          serviceInfo: true,
        },
      });

    if (!action) {
      throw new Error("Action not found");
    }

    const service: Service | null = await db.service.findFirst({
      where: {
        userId: user.id,
        service: action.serviceInfo.type,
      },
    });

    if (service && area.channelWatchId && area.ressourceWatchId) {
      await stopWatch(service, area.channelWatchId, area.ressourceWatchId);
    }

    await db.area.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ detail: "Area deleted successfully" });
  } catch (error) {
    console.error("Error deleting area:", error);
    return NextResponse.json(
      { detail: "Failed to delete area" },
      { status: 500 }
    );
  }
}
