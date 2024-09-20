import { db } from "@/lib/db";
import { ServiceAction, ServiceInfo, ServiceReaction } from "@prisma/client";
import { NextResponse } from "next/server";

export type ServiceInfoWithActionsAndReactions = {
  actions: ServiceAction[];
  reactions: ServiceReaction[];
} & ServiceInfo;

export async function GET(request: Request): Promise<NextResponse> {
  const clientIp: string =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("remote-addr") ||
    "unknown";

  const currentTime: number = Math.floor(Date.now() / 1000);

  const services = await db.serviceInfo.findMany({
    include: {
      actions: true,
      reactions: true,
    },
  });

  const response = {
    client: {
      host: clientIp,
    },
    server: {
      current_time: currentTime,
      services: services.map((service) => ({
        name: service.name,
        actions: service.actions.map((action) => ({
          name: action.name,
          description: action.description,
        })),
        reactions: [],
      })),
    },
  };

  return NextResponse.json(response);
}
