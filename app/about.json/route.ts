import { db } from "@/lib/db";
import {
  ServiceAction,
  ServiceInfo,
  ServiceReaction,
  ServiceType,
} from "@prisma/client";
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

  const services: ServiceInfoWithActionsAndReactions[] =
    await db.serviceInfo.findMany({
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
      services: services.map(
        (
          service: ServiceInfoWithActionsAndReactions
        ): {
          name: ServiceType;
          actions: {
            name: string;
            description: string;
          }[];
          reactions: {
            name: string;
            description: string;
          }[];
        } => ({
          name: service.type,
          actions: service.actions.map(
            (action: ServiceAction): { name: string; description: string } => ({
              name: action.name,
              description: action.description,
            })
          ),
          reactions: service.reactions.map(
            (
              reaction: ServiceReaction
            ): { name: string; description: string } => ({
              name: reaction.name,
              description: reaction.description,
            })
          ),
        })
      ),
    },
  };

  return NextResponse.json(response);
}
