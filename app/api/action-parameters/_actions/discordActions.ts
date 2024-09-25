import {
  findCommonGuilds,
  getBotGuilds,
  getDiscordAccessToken,
  getUserGuilds,
} from "@/lib/discord";
import { NextResponse } from "next/server";

export async function handleDiscordAction(
  action: string
): Promise<NextResponse<any>> {
  const userAccessToken: string = await getDiscordAccessToken();
  const userGuilds: any = await getUserGuilds(userAccessToken);
  const botGuilds: any = await getBotGuilds();
  const commonGuilds: any[] = findCommonGuilds(userGuilds, botGuilds);

  if (commonGuilds.length === 0) {
    return NextResponse.json({ detail: "No guilds found" }, { status: 400 });
  }

  switch (action) {
    case "New pinned message in channel":
    case "New message in channel":
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

    case "Post a message to a channel":
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
          {
            name: "message",
            label: "Message",
            type: "text",
          },
        ],
      });

    case "Post a rich message to a channel":
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
          {
            name: "message",
            label: "Message",
            type: "text",
          },
          {
            name: "embedTitle",
            label: "Embed Title",
            type: "text",
          },
          {
            name: "embedDescription",
            label: "Embed Description",
            type: "text",
          },
          {
            name: "embedFooter",
            label: "Embed Footer",
            type: "text",
          },
          {
            name: "embedColor",
            label: "Embed Color",
            type: "text",
          },
        ],
      });

    default:
      return NextResponse.json({ detail: "Invalid action" }, { status: 400 });
  }
}
