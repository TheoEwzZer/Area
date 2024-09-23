import { ServiceInfoWithActionsAndReactions } from "@/app/about.json/route";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(): Promise<
  NextResponse<ServiceInfoWithActionsAndReactions[]> | undefined
> {
  try {
    const services: ServiceInfoWithActionsAndReactions[] =
      await db.serviceInfo.findMany({
        include: {
          actions: true,
          reactions: true,
        },
      });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
  }
}
