import { db } from "@/lib/db";
import { EventHandler, eventHandlers } from "@/lib/eventManager";
import { AreaWithDetails } from "@/types/globals";
import { currentUser, User } from "@clerk/nextjs/server";
import {
  Action,
  Area,
  Reaction,
  ReactionData,
  Service,
  ServiceInfo,
  ServiceType,
} from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export interface AreaWithAction extends Area {
  action: Action & {
    serviceInfo: ServiceInfo;
  };
}

export interface ReactionDataWithReaction extends ReactionData {
  reaction: Reaction & {
    serviceInfo: ServiceInfo;
  };
}

async function getServiceInfo(type: ServiceType): Promise<ServiceInfo | null> {
  return await db.serviceInfo.findUnique({
    where: { type },
  });
}

async function createReactions(
  reactions: Reaction[],
  reactionParameters: any[],
  areaId: number
): Promise<void> {
  await Promise.all(
    reactions.map((reaction: Reaction, index: number) =>
      db.reactionData.create({
        data: {
          data: reactionParameters[index],
          area: {
            connect: { id: areaId },
          },
          reaction: {
            connect: { id: reaction.id },
          },
        },
      })
    )
  );
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
    reactionServices,
    reactionNames,
    reactionParameters,
  } = await req.json();
  const user: User | null = await currentUser();

  try {
    const actionServiceInfo: ServiceInfo | null =
      await getServiceInfo(actionService);
    if (!actionServiceInfo) {
      return NextResponse.json(
        { detail: "Action service information not found" },
        { status: 404 }
      );
    }

    const action: Action | null = await db.action.findFirst({
      where: {
        serviceInfoId: actionServiceInfo.id,
        name: actionName,
      },
    });
    if (!action) {
      return NextResponse.json({ detail: "Action not found" }, { status: 404 });
    }

    const reactions: Reaction[] = await getReactions(
      reactionServices,
      reactionNames
    );
    if (reactions.length === 0) {
      return NextResponse.json(
        { detail: "Reactions not found" },
        { status: 404 }
      );
    }

    if (user?.id && action.id) {
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

      const { ressourceWatchId, channelWatchId } = await setupWebhookIfNeeded(
        actionService,
        service,
        actionParameters,
        action.id
      );

      const newArea: Area = await createArea(
        user.id,
        action.id,
        actionParameters,
        action,
        reactions,
        channelWatchId,
        ressourceWatchId
      );

      await createReactions(reactions, reactionParameters, newArea.id);

      return NextResponse.json(newArea);
    } else {
      throw new Error("User ID, Action ID, or Reactions are undefined");
    }
  } catch (error) {
    console.error("Error creating area:", error);
    return NextResponse.json(
      { detail: "Failed to create area" },
      { status: 500 }
    );
  }
}

async function getReactions(
  reactionServices: ServiceType[],
  reactionNames: string[]
): Promise<Reaction[]> {
  const reactions: Reaction[] = [];
  for (let i: number = 0; i < reactionServices.length; i++) {
    const reactionServiceInfo: ServiceInfo | null = await getServiceInfo(
      reactionServices[i]
    );
    if (!reactionServiceInfo) {
      throw new Error(
        `Reaction service information not found for ${reactionServices[i]}`
      );
    }

    const reaction: Reaction | null = await db.reaction.findFirst({
      where: {
        serviceInfoId: reactionServiceInfo.id,
        name: reactionNames[i],
      },
    });
    if (!reaction) {
      throw new Error(`Reaction not found for ${reactionNames[i]}`);
    }

    reactions.push(reaction);
  }
  return reactions;
}

async function setupWebhookIfNeeded(
  actionService: ServiceType,
  service: Service,
  actionParameters: any,
  actionId: number
): Promise<{ ressourceWatchId: string | null; channelWatchId: string | null }> {
  const handler: EventHandler = eventHandlers[actionService];
  let ressourceWatchId: string | null = null;
  let channelWatchId: string | null = null;
  if (handler?.setupWebhook) {
    const result: [string, string] | null = await handler.setupWebhook(
      service,
      actionParameters,
      actionId
    );
    if (result) {
      [ressourceWatchId, channelWatchId] = result;
    }
  }
  return { ressourceWatchId, channelWatchId };
}

async function createArea(
  userId: string,
  actionId: number,
  actionParameters: any,
  action: Action,
  reactions: Reaction[],
  channelWatchId: string | null,
  ressourceWatchId: string | null
): Promise<Area> {
  return await db.area.create({
    data: {
      userId,
      actionId,
      actionData: actionParameters,
      title: `If ${action.name.toLowerCase()}, then ${reactions
        .map((r: Reaction, index: number): string => {
          if (index === reactions.length - 1 && reactions.length > 1) {
            return `and ${r.name.toLowerCase()}`;
          }
          return r.name.toLowerCase();
        })
        .join(", ")
        .replace(/, and/, " and")}`,
      channelWatchId,
      ressourceWatchId,
    },
  });
}

export async function GET(): Promise<
  NextResponse<{ detail: string }> | NextResponse<AreaWithDetails[]>
> {
  const user: User | null = await currentUser();

  if (!user) {
    return NextResponse.json(
      { detail: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    const areas: AreaWithAction[] = await db.area.findMany({
      where: {
        userId: user.id,
      },
      include: {
        action: {
          include: {
            serviceInfo: true,
          },
        },
      },
    });

    const areasWithDetails: AreaWithDetails[] = await Promise.all(
      areas.map(async (area: AreaWithAction) => {
        const reactionData: ReactionDataWithReaction[] =
          await db.reactionData.findMany({
            where: {
              areaId: area.id,
            },
            include: {
              reaction: {
                include: {
                  serviceInfo: true,
                },
              },
            },
          });

        const reactions: {
          reactionData: ReactionData;
          serviceInfo: ServiceInfo;
          id: number;
          name: string;
          description: string;
          serviceInfoId: number;
        }[] = reactionData.map((rd: ReactionDataWithReaction) => ({
          ...rd.reaction,
          reactionData: {
            id: rd.id,
            data: rd.data,
            areaId: rd.areaId,
            reactionId: rd.reactionId,
          },
        }));

        return {
          ...area,
          reactions,
        };
      })
    );

    return NextResponse.json(areasWithDetails);
  } catch (error) {
    console.error("Error fetching areas:", error);
    return NextResponse.json(
      { detail: "Failed to fetch areas" },
      { status: 500 }
    );
  }
}
