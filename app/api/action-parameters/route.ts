import {
  findCommonGuilds,
  getBotGuilds,
  getDiscordAccessToken,
  getDiscordChannels,
  getUserGuilds,
} from "@/lib/discord";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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
      case "DISCORD": {
        switch (action) {
          case "New pinned message in channel": {
            const userAccessToken: string = await getDiscordAccessToken();
            const userGuilds: any = await getUserGuilds(userAccessToken);
            const botGuilds: any = await getBotGuilds();
            const commonGuilds: any[] = findCommonGuilds(userGuilds, botGuilds);

            if (commonGuilds.length === 0) {
              return NextResponse.json(
                { detail: "No guilds found" },
                { status: 400 }
              );
            }

            return NextResponse.json({
              actionName: action,
              parameters: [
                {
                  name: "guild",
                  label: "Select Discord Server",
                  type: "select",
                  options: commonGuilds.map((guild: any) => ({
                    value: guild.id,
                    label: guild.name,
                  })),
                },
                {
                  name: "channel",
                  label: "Select Channel",
                  type: "select",
                  options: [],
                },
              ],
            });
          }
          // Add more Discord actions here
        }
        break;
      }
      // Add more services here
    }

    return NextResponse.json(
      { detail: "Invalid service or action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching action parameters:", error);
    return NextResponse.json(
      { detail: "Error fetching action parameters" },
      { status: 500 }
    );
  }
}
