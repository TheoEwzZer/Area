import { EventHandler, eventHandlers } from "@/lib/eventManager";
import { Service } from "@prisma/client";
import {
  Client,
  GatewayIntentBits,
  GuildMember,
  Message,
  MessageReaction,
  OmitPartialGroupDMChannel,
  PartialGuildMember,
  PartialMessage,
  PartialMessageReaction,
} from "discord.js";
import {
  AreaWithAction,
  ReactionDataWithReaction,
} from "./app/api/areas/route";
import { db } from "./lib/db";
import { AreaWithDetails } from "./types/globals";

export const discordClient: Client<boolean> = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

async function getAreasWithDetails(
  areas: AreaWithAction[]
): Promise<AreaWithDetails[]> {
  const areasWithDetails: AreaWithDetails[] = await Promise.all(
    areas.map(async (area: AreaWithAction) => {
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

      return {
        ...area,
        reactions,
      };
    })
  );

  return areasWithDetails;
}

try {
  const handleMessage: (
    message: Message | PartialMessage,
    actionName: string
  ) => Promise<void> = async (
    message: Message | PartialMessage,
    actionName: string
  ): Promise<void> => {
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

    const areasWithDetails: AreaWithDetails[] =
      await getAreasWithDetails(areas);

    for (const area of areasWithDetails) {
      if (
        area.actionData &&
        typeof area.actionData === "object" &&
        "channel" in area.actionData
      ) {
        const actionData = area.actionData as { channel: string };
        if (actionData.channel === message.channel.id) {
          for (const reaction of area.reactions) {
            const handlerReaction: EventHandler | undefined =
              eventHandlers[reaction.serviceInfo.type];
            if (!handlerReaction?.executeReaction) {
              console.error(
                `Reaction handler not found for ${reaction.serviceInfo.type}`
              );
              continue;
            }

            const serviceReaction: Service | null = await db.service.findFirst({
              where: {
                userId: area.userId,
                service: reaction.serviceInfo.type,
              },
            });

            if (!serviceReaction) {
              console.error(
                `Service not found for user ${area.userId} and service ${reaction.serviceInfo.type}`
              );
              continue;
            }

            await handlerReaction.executeReaction(
              reaction,
              reaction.reactionData.data,
              serviceReaction
            );
          }
        }
      }
    }
  };

  const handleMemberEvent: (
    member: GuildMember,
    actionName: string
  ) => Promise<void> = async (
    member: GuildMember,
    actionName: string
  ): Promise<void> => {
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

    const areasWithDetails: AreaWithDetails[] =
      await getAreasWithDetails(areas);

    for (const area of areasWithDetails) {
      if (
        area.actionData &&
        typeof area.actionData === "object" &&
        "guild" in area.actionData
      ) {
        const actionData = area.actionData as { guild: string };
        if (actionData.guild === member.guild.id) {
          for (const reaction of area.reactions) {
            const handlerReaction: EventHandler | undefined =
              eventHandlers[reaction.serviceInfo.type];
            if (!handlerReaction?.executeReaction) {
              console.error(
                `Reaction handler not found for ${reaction.serviceInfo.type}`
              );
              continue;
            }

            const serviceReaction: Service | null = await db.service.findFirst({
              where: {
                userId: area.userId,
                service: reaction.serviceInfo.type,
              },
            });

            if (!serviceReaction) {
              console.error(
                `Service not found for user ${area.userId} and service ${reaction.serviceInfo.type}`
              );
              continue;
            }

            await handlerReaction.executeReaction(
              reaction,
              reaction.reactionData.data,
              serviceReaction
            );
          }
        }
      }
    }
  };

  const handleReactionEvent: (
    reaction: MessageReaction | PartialMessageReaction,
    actionName: string
  ) => Promise<void> = async (
    reaction: MessageReaction | PartialMessageReaction,
    actionName: string
  ): Promise<void> => {
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

    const areasWithDetails: AreaWithDetails[] =
      await getAreasWithDetails(areas);

    for (const area of areasWithDetails) {
      if (
        area.actionData &&
        typeof area.actionData === "object" &&
        "channel" in area.actionData
      ) {
        const actionData = area.actionData as { channel: string };
        if (actionData.channel === reaction.message.channel.id) {
          for (const reaction of area.reactions) {
            const handlerReaction: EventHandler | undefined =
              eventHandlers[reaction.serviceInfo.type];
            if (!handlerReaction?.executeReaction) {
              console.error(
                `Reaction handler not found for ${reaction.serviceInfo.type}`
              );
              continue;
            }

            const serviceReaction: Service | null = await db.service.findFirst({
              where: {
                userId: area.userId,
                service: reaction.serviceInfo.type,
              },
            });

            if (!serviceReaction) {
              console.error(
                `Service not found for user ${area.userId} and service ${reaction.serviceInfo.type}`
              );
              continue;
            }

            await handlerReaction.executeReaction(
              reaction,
              reaction.reactionData.data,
              serviceReaction
            );
          }
        }
      }
    }
  };

  discordClient.on(
    "messageCreate",
    (message: OmitPartialGroupDMChannel<Message>): Promise<void> => {
      if (message.pinned) {
        return Promise.resolve();
      }
      return handleMessage(message, "New message in channel");
    }
  );

  discordClient.on(
    "messageUpdate",
    (
      oldMessage: Message | PartialMessage,
      newMessage: Message | PartialMessage
    ): Promise<void> => {
      if (newMessage.pinned && !oldMessage.pinned) {
        return handleMessage(newMessage, "New pinned message in channel");
      }
      return Promise.resolve();
    }
  );

  discordClient.on("guildMemberAdd", (member: GuildMember): Promise<void> => {
    return handleMemberEvent(member, "New member in guild");
  });

  discordClient.on(
    "guildMemberRemove",
    async (member: GuildMember | PartialGuildMember): Promise<void> => {
      if (member instanceof GuildMember) {
        return handleMemberEvent(member, "Member left guild");
      } else {
        const fullMember: GuildMember = await member.fetch();
        return handleMemberEvent(fullMember, "Member left guild");
      }
    }
  );

  discordClient.on(
    "messageDelete",
    (
      message: OmitPartialGroupDMChannel<Message | PartialMessage>
    ): Promise<void> => {
      return handleMessage(message, "Message deleted in channel");
    }
  );

  discordClient.on(
    "messageReactionAdd",
    (reaction: MessageReaction | PartialMessageReaction): Promise<void> => {
      return handleReactionEvent(reaction, "Reaction added to message");
    }
  );

  discordClient.login(process.env.DISCORD_BOT_TOKEN);
} catch (error) {
  console.error("Error initializing Discord bot:", error);
}
