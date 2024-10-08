import { FullReaction } from "@/app/my-areas/page";
import { db } from "@/lib/db";
import { EventHandler, eventHandlers } from "@/lib/eventManager";
import { AreaWithDetails } from "@/types/globals";
import { Service } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { AreaWithAction } from "../../areas/route";
import { getAreaWithDetails } from "../github/route";

export async function POST(
  req: NextRequest
): Promise<NextResponse<{ detail: string }>> {
  const { channelId, resourceId, resourceState } = getHeaders(req);

  if (!channelId || !resourceId || !resourceState) {
    return NextResponse.json({ detail: "Missing headers" }, { status: 400 });
  }

  const areas: AreaWithDetails[] = await findAreas(channelId, resourceId);
  if (areas.length === 0) {
    return NextResponse.json({ detail: "Areas not found" }, { status: 404 });
  }

  for (const area of areas) {
    const [serviceAction, ...serviceReaction] = await findServices(area);
    if (!serviceAction || serviceReaction.length === 0) {
      return NextResponse.json(
        { detail: "Services not found" },
        { status: 404 }
      );
    }

    await handleResourceState(
      resourceState,
      area,
      serviceAction,
      serviceReaction
    );
  }

  return NextResponse.json({
    detail: "All triggers fired and reactions executed",
  });
}

function getHeaders(req: NextRequest): {
  channelId: string | null;
  resourceId: string | null;
  resourceState: string | null;
} {
  const channelId: string | null = req.headers.get("x-goog-channel-id");
  const resourceId: string | null = req.headers.get("x-goog-resource-id");
  const resourceState: string | null = req.headers.get("x-goog-resource-state");
  return { channelId, resourceId, resourceState };
}

async function findAreas(
  channelId: string,
  resourceId: string
): Promise<AreaWithDetails[]> {
  const areas: AreaWithAction[] = await db.area.findMany({
    where: {
      channelWatchId: channelId,
      ressourceWatchId: resourceId,
      isActive: true,
    },
    include: {
      action: {
        include: {
          serviceInfo: true,
        },
      },
    },
  });

  if (areas.length === 0) {
    return [];
  }

  const areasWithDetails: AreaWithDetails[] = await Promise.all(
    areas.map(
      (area: AreaWithAction): Promise<AreaWithDetails> =>
        getAreaWithDetails(area)
    )
  );

  return areasWithDetails;
}

async function findServices(
  area: AreaWithDetails
): Promise<(Service | null)[]> {
  const serviceAction: Service | null = await db.service.findFirst({
    where: {
      userId: area.userId,
      service: area.action.serviceInfo.type,
    },
  });

  const serviceReactions: (Service | null)[] = await Promise.all(
    area.reactions.map(async (reaction: FullReaction) => {
      return await db.service.findFirst({
        where: {
          userId: area.userId,
          service: reaction.serviceInfo.type,
        },
      });
    })
  );

  return [serviceAction, ...serviceReactions];
}

async function handleResourceState(
  resourceState: string,
  area: AreaWithDetails,
  serviceAction: Service,
  serviceReactions: (Service | null)[]
): Promise<NextResponse<{ detail: string }>> {
  if (resourceState !== "exists") {
    return NextResponse.json({ detail: "No action needed" });
  }

  const handler: EventHandler | undefined = eventHandlers.GOOGLE_CALENDAR;
  if (!handler?.checkTrigger) {
    return NextResponse.json({ detail: "Event handler not found" });
  }

  const triggerFired: boolean | undefined = await handler.checkTrigger(
    area.action,
    area.actionData,
    serviceAction
  );
  if (!triggerFired) {
    return NextResponse.json({ detail: "Trigger not fired" });
  }

  for (let index: number = 0; index < area.reactions.length; index++) {
    const reaction: FullReaction = area.reactions[index];
    const handlerReaction: EventHandler | undefined =
      eventHandlers[reaction.serviceInfo.type];

    if (!handlerReaction?.executeReaction) {
      return NextResponse.json({ detail: "Reaction handler not found" });
    }

    const serviceReaction: Service | null = serviceReactions[index];
    if (!serviceReaction) {
      return NextResponse.json({ detail: "Service reaction not found" });
    }

    await handlerReaction.executeReaction(
      reaction,
      reaction.reactionData.data,
      serviceReaction
    );
  }

  return NextResponse.json({ detail: "Trigger fired and reactions executed" });
}
