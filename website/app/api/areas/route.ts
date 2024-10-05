import { db } from "@/lib/db";
import { EventHandler, eventHandlers } from "@/lib/eventManager";
import { currentUser, User } from "@clerk/nextjs/server";
import { Action, Area, Reaction, Service, ServiceInfo } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface AreaWithServiceInfo extends Area {
  action: {
    serviceInfo: ServiceInfo;
  };
  reaction: {
    serviceInfo: ServiceInfo;
  };
}

export interface AreaWithServiceInfoOnly extends Area {
  actionServiceInfo: ServiceInfo;
  reactionServiceInfo: ServiceInfo;
}

export async function POST(req: NextRequest): Promise<
  | NextResponse<{
      detail: string;
    }>
  | NextResponse<Area>
> {
  const {
    actionService,
    actionName,
    actionParameters,
    reactionService,
    reactionName,
    reactionParameters,
  } = await req.json();
  const user: User | null = await currentUser();

  try {
    const actionServiceInfo: ServiceInfo | null =
      await db.serviceInfo.findUnique({
        where: { type: actionService },
      });

    const reactionServiceInfo: ServiceInfo | null =
      await db.serviceInfo.findUnique({
        where: { type: reactionService },
      });

    if (!actionServiceInfo || !reactionServiceInfo) {
      return NextResponse.json(
        { detail: "Service information not found" },
        { status: 404 }
      );
    }

    const action: Action | null = await db.action.findFirst({
      where: {
        serviceInfoId: actionServiceInfo.id,
        name: actionName,
      },
    });

    const reaction: Reaction | null = await db.reaction.findFirst({
      where: {
        serviceInfoId: reactionServiceInfo.id,
        name: reactionName,
      },
    });

    if (!action || !reaction) {
      return NextResponse.json(
        { detail: "Action or reaction not found" },
        { status: 404 }
      );
    }

    if (user?.id && action.id && reaction.id) {
      const service: Service | null = await db.service.findFirst({
        where: {
          userId: user.id,
          service: actionService,
        },
      });

      if (!service) {
        return NextResponse.json(
          { detail: "Service not found" },
          { status: 404 }
        );
      }

      const handler: EventHandler = eventHandlers[actionService];
      let ressourceWatchId: string = "";
      let channelWatchId: string = "";
      if (handler?.setupWebhook) {
        [ressourceWatchId, channelWatchId] = await handler.setupWebhook(
          service,
          actionParameters,
          action.id
        );
      }

      const newArea: Area = await db.area.create({
        data: {
          userId: user.id,
          actionId: action.id,
          reactionId: reaction.id,
          actionData: actionParameters,
          reactionData: reactionParameters,
          title: `If ${action.name.toLowerCase()}, then ${reaction.name.toLowerCase()}`,
          channelWatchId: channelWatchId,
          ressourceWatchId: ressourceWatchId,
        },
      });
      return NextResponse.json(newArea);
    } else {
      throw new Error("User ID, Action ID, or Reaction ID is undefined");
    }
  } catch (error) {
    console.error("Error creating area:", error);
    return NextResponse.json(
      { detail: "Failed to create area" },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<
  | NextResponse<{
      detail: string;
    }>
  | NextResponse<AreaWithServiceInfoOnly[]>
> {
  const user: User | null = await currentUser();

  if (!user) {
    return NextResponse.json(
      { detail: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    const areas: AreaWithServiceInfo[] = await db.area.findMany({
      where: {
        userId: user.id,
      },
      include: {
        action: {
          select: {
            serviceInfo: true,
          },
        },
        reaction: {
          select: {
            serviceInfo: true,
          },
        },
      },
    });

    const areasWithServiceInfo: AreaWithServiceInfoOnly[] = areas.map(
      (area: AreaWithServiceInfo) => ({
        ...area,
        actionServiceInfo: area.action.serviceInfo,
        reactionServiceInfo: area.reaction.serviceInfo,
      })
    );
    return NextResponse.json(areasWithServiceInfo);
  } catch (error) {
    console.error("Error fetching areas:", error);
    return NextResponse.json(
      { detail: "Failed to fetch areas" },
      { status: 500 }
    );
  }
}
