import { getDiscordChannels } from "@/lib/discord";
import { NextRequest, NextResponse } from "next/server";
import { handleDiscordAction } from "./_actions/discordActions";
import { handleGoogleCalendarAction } from "./_actions/googleCalendarActions";

export async function GET(req: NextRequest): Promise<NextResponse<any>> {
  const { searchParams } = req.nextUrl;
  const service: string | null = searchParams.get("service");
  const action: string | null = searchParams.get("action");
  const guildId: string | null = searchParams.get("guildId");

  if (guildId) {
    try {
      const channels = await getDiscordChannels(guildId);
      return NextResponse.json(channels);
    } catch (error) {
      console.error("Error fetching channels:", error);
      return NextResponse.json(
        { detail: "Error fetching channels" },
        { status: 500 }
      );
    }
  }

  if (typeof service !== "string" || typeof action !== "string") {
    return NextResponse.json(
      { detail: "Invalid service or action" },
      { status: 400 }
    );
  }

  try {
    switch (service) {
      case "DISCORD":
        return handleDiscordAction(action);
      case "GOOGLE_CALENDAR":
        return handleGoogleCalendarAction(action);
      default:
        return NextResponse.json(
          { detail: "Invalid service" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error fetching action parameters:", error);
    return NextResponse.json(
      { detail: "Error fetching action parameters" },
      { status: 500 }
    );
  }
}
