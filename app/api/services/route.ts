import { db } from "@/lib/db";
import { ServiceAction, ServiceInfo } from "@prisma/client";
import { NextResponse } from "next/server";

export type ServiceInfoWithActions = {
  actions: ServiceAction[];
} & ServiceInfo;

export async function GET(): Promise<
  NextResponse<ServiceInfoWithActions[]> | undefined
> {
  try {
    const services: ServiceInfoWithActions[] = await db.serviceInfo.findMany({
      include: {
        actions: true,
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
  }
}
