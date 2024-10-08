import { FullReaction } from "@/app/my-areas/page";
import { db } from "@/lib/db";
import { EventHandler, eventHandlers } from "@/lib/eventManager";
import { AreaWithDetails } from "@/types/globals";
import { Service } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { AreaWithAction, ReactionDataWithReaction } from "../../areas/route";

export async function POST(
  req: NextRequest
): Promise<NextResponse<{ detail: string }>> {
  const { event, delivery } = getHeaders(req);

  if (!event || !delivery) {
    return NextResponse.json({ detail: "Missing headers" }, { status: 400 });
  }

  const payload: any = await req.json();
  const areas: AreaWithDetails[] = await findAreas(event, payload);
  if (areas.length === 0) {
    return NextResponse.json({ detail: "Areas not found" }, { status: 404 });
  }

  for (const area of areas) {
    for (const reaction of area.reactions) {
      const serviceReaction: Service | null = await db.service.findFirst({
        where: {
          userId: area.userId,
          service: reaction.serviceInfo.type,
        },
      });
      if (!serviceReaction) {
        return NextResponse.json(
          { detail: "Services not found" },
          { status: 404 }
        );
      }

      await handleEvent(payload, area, serviceReaction, reaction);
    }
  }

  return NextResponse.json({
    detail: "All triggers fired and reactions executed",
  });
}

function getHeaders(req: NextRequest): {
  event: string | null;
  delivery: string | null;
} {
  const event: string | null = req.headers.get("x-github-event");
  const delivery: string | null = req.headers.get("x-github-delivery");
  return { event, delivery };
}

export async function getAreaWithDetails(
  area: AreaWithAction
): Promise<AreaWithDetails> {
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

  const reactions = reactionData.map((rd: ReactionDataWithReaction) => ({
    ...rd.reaction,
    reactionData: {
      id: rd.id,
      data: rd.data,
      areaId: rd.areaId,
      reactionId: rd.reactionId,
    },
  }));

  const areaWithDetails: AreaWithDetails = {
    ...area,
    reactions,
  };

  return areaWithDetails;
}

async function findAreas(
  event: string,
  payload: any
): Promise<AreaWithDetails[]> {
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
      return [];
  }

  if (!actionName) {
    return [];
  }

  const areas: AreaWithAction[] = await db.area.findMany({
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

async function handleEvent(
  payload: any,
  area: AreaWithDetails,
  serviceReaction: Service,
  reaction: FullReaction
): Promise<void> {
  if (
    typeof area.actionData === "object" &&
    area.actionData !== null &&
    "account" in area.actionData
  ) {
    if (area.actionData.account !== payload.repository.owner.login) {
      throw new Error("Account mismatch");
    }
  } else {
    throw new Error("Invalid actionData");
  }

  const handlerReaction: EventHandler | undefined =
    eventHandlers[reaction.serviceInfo.type];
  if (!handlerReaction?.executeReaction) {
    throw new Error("Reaction handler not found");
  }

  await handlerReaction.executeReaction(
    reaction,
    reaction.reactionData.data,
    serviceReaction
  );
}
