import { db } from "@/lib/db";
import { EventHandler, eventHandlers } from "@/lib/eventManager";
import { Action, Area, Reaction, Service, ServiceInfo } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface AreaWithDetails extends Area {
  action: Action & {
    serviceInfo: ServiceInfo;
  };
  reaction: Reaction & {
    serviceInfo: ServiceInfo;
  };
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<{ detail: string }>> {
  const { channelId, resourceId, resourceState } = getHeaders(req);

  if (!channelId || !resourceId || !resourceState) {
    return NextResponse.json({ detail: "Missing headers" }, { status: 400 });
  }

  const area: AreaWithDetails | null = await findArea(channelId, resourceId);
  if (!area) {
    return NextResponse.json({ detail: "Area not found" }, { status: 404 });
  }

  const [serviceAction, serviceReaction] = await findServices(area);
  if (!serviceAction || !serviceReaction) {
    return NextResponse.json({ detail: "Services not found" }, { status: 404 });
  }

  return handleResourceState(
    resourceState,
    area,
    serviceAction,
    serviceReaction
  );
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

async function findArea(
  channelId: string,
  resourceId: string
): Promise<AreaWithDetails | null> {
  return await db.area.findFirst({
    where: {
      channelWatchId: channelId,
      ressourceWatchId: resourceId,
    },
    include: {
      action: {
        include: {
          serviceInfo: true,
        },
      },
      reaction: {
        include: {
          serviceInfo: true,
        },
      },
    },
  });
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

  const serviceReaction: Service | null = await db.service.findFirst({
    where: {
      userId: area.userId,
      service: area.reaction.serviceInfo.type,
    },
  });

  return [serviceAction, serviceReaction];
}

async function handleResourceState(
  resourceState: string,
  area: AreaWithDetails,
  serviceAction: Service,
  serviceReaction: Service
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

  const handlerReaction: EventHandler | undefined =
    eventHandlers[area.reaction.serviceInfo.type];
  if (!handlerReaction?.executeReaction) {
    return NextResponse.json({ detail: "Reaction handler not found" });
  }

  await handlerReaction.executeReaction(
    area.reaction,
    area.reactionData,
    serviceReaction
  );
  return NextResponse.json({ detail: "Trigger fired and reaction executed" });
}
