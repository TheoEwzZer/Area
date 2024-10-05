import { db } from "@/lib/db";
import { EventHandler, eventHandlers } from "@/lib/eventManager";
import { Action, Area, Reaction, Service, ServiceInfo } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<
  NextResponse<{
    detail: string;
  }>
> {
  const channelId: string | null = req.headers.get("x-goog-channel-id");
  const resourceId: string | null = req.headers.get("x-goog-resource-id");
  const resourceState: string | null = req.headers.get("x-goog-resource-state");

  if (!channelId || !resourceId || !resourceState) {
    return NextResponse.json({ detail: "Missing headers" }, { status: 400 });
  }

  const area:
    | (Area & {
        action: Action & {
          serviceInfo: ServiceInfo;
        };
        reaction: Reaction;
      })
    | null = await db.area.findFirst({
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
      reaction: true,
    },
  });

  if (!area) {
    return NextResponse.json({ detail: "Area not found" }, { status: 404 });
  }

  const service: Service | null = await db.service.findFirst({
    where: {
      userId: area.userId,
      service: area.action.serviceInfo.type,
    },
  });

  if (!service) {
    return NextResponse.json({ detail: "Service not found" }, { status: 404 });
  }

  if (resourceState === "exists") {
    const handler: EventHandler = eventHandlers.GOOGLE_CALENDAR;
    const triggerFired: boolean | undefined = await handler.checkTrigger(
      area.action,
      area.actionData,
      service
    );

    if (triggerFired) {
      await handler.executeReaction(area.reaction, area.reactionData, service);
      return NextResponse.json({
        detail: "Trigger fired and reaction executed",
      });
    } else {
      return NextResponse.json({ detail: "Trigger not fired" });
    }
  } else {
    return NextResponse.json({ detail: "No action needed" });
  }
}
