import { db } from "@/lib/db";
import { EventHandler, eventHandlers } from "@/lib/eventManager";
import { AreaWithDetails } from "@/types/globals";
import { Service } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest
): Promise<NextResponse<{ detail: string }>> {
  const { event, delivery } = getHeaders(req);

  if (!event || !delivery) {
    return NextResponse.json({ detail: "Missing headers" }, { status: 400 });
  }

  const payload = await req.json();
  const area: AreaWithDetails | null = await findArea(event, payload);
  if (!area) {
    return NextResponse.json({ detail: "Area not found" }, { status: 404 });
  }

  const serviceReaction: Service | null = await db.service.findFirst({
    where: {
      userId: area.userId,
      service: area.reaction.serviceInfo.type,
    },
  });
  if (!serviceReaction) {
    return NextResponse.json({ detail: "Services not found" }, { status: 404 });
  }

  return handleEvent(payload, area, serviceReaction);
}

function getHeaders(req: NextRequest): {
  event: string | null;
  delivery: string | null;
} {
  const event: string | null = req.headers.get("x-github-event");
  const delivery: string | null = req.headers.get("x-github-delivery");
  return { event, delivery };
}

async function findArea(
  event: string,
  payload: any
): Promise<AreaWithDetails | null> {
  let actionName: string | undefined;

  switch (event) {
    case "issues":
      if (payload.action === "opened") {
        actionName = "Any new issue";
      }
      break;
    case "pull_request":
      if (payload.action === "opened") {
        actionName = "Any new pull request";
      }
      break;
    default:
      return null;
  }

  if (!actionName) {
    return null;
  }

  return await db.area.findFirst({
    where: {
      action: {
        name: actionName,
      },
      isActive: true,
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

async function handleEvent(
  payload: any,
  area: AreaWithDetails,
  serviceReaction: Service
): Promise<NextResponse<{ detail: string }>> {
  if (
    typeof area.actionData === "object" &&
    area.actionData !== null &&
    "account" in area.actionData
  ) {
    if (area.actionData.account !== payload.repository.owner.login) {
      return NextResponse.json({ detail: "Account mismatch" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ detail: "Invalid actionData" }, { status: 400 });
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
