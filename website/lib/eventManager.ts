import { Action, Reaction, Service } from "@prisma/client";
import { GaxiosResponse } from "gaxios";
import { OAuth2Client } from "google-auth-library";
import { calendar_v3, google } from "googleapis";

export interface EventHandler {
  checkTrigger: (
    action: Action,
    actionData: any,
    service: Service
  ) => Promise<boolean | undefined>;
  executeReaction: (
    reaction: Reaction,
    reactionData: any,
    service: Service
  ) => Promise<void>;
  setupWebhook?: (
    service: Service,
    actionData: any,
    actionId: number
  ) => Promise<string>;
}

export async function stopWatchCalendar(
  service: Service,
  channelId: string,
  ressourceWatchId: string
): Promise<void> {
  const auth: OAuth2Client = googleAuth(service);

  if (!service.accessToken || !service.refreshToken) {
    throw new Error(
      "Invalid OAuth2 credentials: Missing access token or refresh token."
    );
  }

  const calendar = google.calendar({ version: "v3", auth });

  try {
    await calendar.channels.stop({
      requestBody: {
        id: channelId,
        resourceId: ressourceWatchId,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to stop channel watch: ${error.message}`);
    }
    throw error;
  }
}

const googleAuth: (service: Service) => OAuth2Client = (
  service: Service
): OAuth2Client => {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  auth.setCredentials({
    access_token: service.accessToken,
    refresh_token: service.refreshToken,
  });
  return auth;
};

export const eventHandlers: Record<string, EventHandler> = {
  GOOGLE_CALENDAR: {
    checkTrigger: async (
      action: Action,
      actionData: any,
      service: Service
    ): Promise<boolean | undefined> => {
      const auth: OAuth2Client = googleAuth(service);
      const calendar = google.calendar({ version: "v3", auth });

      switch (action.name) {
        case "New event added": {
          const now = new Date();
          const oneMinuteAgo: string = new Date(
            now.getTime() - 1 * 60000
          ).toISOString();

          const response: GaxiosResponse<calendar_v3.Schema$Events> =
            await calendar.events.list({
              calendarId: actionData.calendar,
              singleEvents: true,
              orderBy: "startTime",
            });

          const newEvents: calendar_v3.Schema$Event[] | undefined =
            response.data.items?.filter(
              (event: calendar_v3.Schema$Event): boolean => {
                if (!event.created) {
                  return false;
                }
                const createdTime: number = new Date(event.created).getTime();
                return createdTime >= new Date(oneMinuteAgo).getTime();
              }
            );

          return newEvents && newEvents.length > 0;
        }

        default:
          console.error(`Unknown Google Calendar action: ${action.name}`);
          return false;
      }
    },
    executeReaction: async (
      reaction: Reaction,
      reactionData: any,
      service: Service
    ): Promise<void> => {
      const auth: OAuth2Client = googleAuth(service);
      const calendar = google.calendar({ version: "v3", auth });

      switch (reaction.name) {
        case "Quick add event":
          await calendar.events.quickAdd({
            calendarId: reactionData.calendar,
            text: reactionData.quickAddText,
          });
          break;

        case "Create a detailed event":
          await calendar.events.insert({
            calendarId: reactionData.calendar,
            requestBody: {
              summary: reactionData.title,
              description: reactionData.description,
              start: {
                dateTime: new Date(reactionData.startTime).toISOString(),
                timeZone: "UTC",
              },
              end: {
                dateTime: new Date(reactionData.endTime).toISOString(),
                timeZone: "UTC",
              },
            },
          });
          break;

        default:
          console.error(`Unknown Google Calendar reaction: ${reaction.name}`);
      }
    },
    setupWebhook: async (
      service: Service,
      actionData: any,
      actionId: number
    ): Promise<string> => {
      const auth: OAuth2Client = googleAuth(service);
      const calendar = google.calendar({ version: "v3", auth });

      const response: GaxiosResponse<calendar_v3.Schema$Channel> =
        await calendar.events.watch({
          calendarId: actionData.calendar,
          requestBody: {
            id: `calendar-watch-${service.userId}-${actionId}`,
            type: "web_hook",
            address: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/google_calendar`,
          },
        });

      return response.data.resourceId!;
    },
  },
};
