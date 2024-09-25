import { db } from "@/lib/db";
import { currentUser, User } from "@clerk/nextjs/server";
import { Service } from "@prisma/client";

export async function getDiscordAccessToken(): Promise<string> {
  const user: User | null = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const userId: string | null = user.id;

  if (!userId) {
    throw new Error("User ID is missing");
  }

  const service: Service | null = await db.service.findFirst({
    where: {
      userId: userId,
      service: "DISCORD",
    },
  });

  if (!service) {
    throw new Error("Discord service not found for user");
  }
  return service.accessToken;
}

export async function getUserGuilds(accessToken: string): Promise<any> {
  const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user guilds");
  }

  return response.json();
}

export async function getBotGuilds(): Promise<any> {
  const botAccessToken: string | undefined = process.env.DISCORD_BOT_TOKEN;

  if (!botAccessToken) {
    throw new Error("Bot access token is missing");
  }

  const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
    headers: {
      Authorization: `Bot ${botAccessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch bot guilds");
  }

  return response.json();
}

export function findCommonGuilds(userGuilds: any[], botGuilds: any[]): any[] {
  const botGuildIds = new Set(botGuilds.map((guild: any): any => guild.id));
  return userGuilds.filter((guild: any): boolean => botGuildIds.has(guild.id));
}

export async function getDiscordChannels(guildId: string): Promise<any> {
  const botAccessToken: string | undefined = process.env.DISCORD_BOT_TOKEN;

  if (!botAccessToken) {
    throw new Error("Bot access token is missing");
  }

  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/channels`,
    {
      headers: {
        Authorization: `Bot ${botAccessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch channels");
  }

  const data = await response.json();
  return data.map((channel: any) => ({
    value: channel.id,
    label: channel.name,
  }));
}
