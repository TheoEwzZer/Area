import { Action, Reaction, Service } from "@prisma/client";
import * as fs from "fs";
import { GaxiosResponse } from "gaxios";
import { OAuth2Client } from "google-auth-library";
import { calendar_v3, google } from "googleapis";
import * as path from "path";
import { Readable } from "stream";
import { finished } from "stream/promises";

export interface EventHandler {
  checkTrigger?: (
    action: Action,
    actionData: any,
    service: Service
  ) => Promise<boolean | undefined>;
  executeReaction?: (
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

async function sendEmail(
  service: Service,
  to: string,
  subject: string,
  text: string
): Promise<void> {
  const auth: OAuth2Client = googleAuth(service);
  const gmail = google.gmail({ version: "v1", auth });

  const email: string = [`To: ${to}`, `Subject: ${subject}`, "", text].join(
    "\n"
  );

  const base64EncodedEmail: string = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  await gmail.users.messages.send({
    auth: auth,
    userId: "me",
    requestBody: {
      raw: base64EncodedEmail,
    },
  });
}

async function downloadVideo(
  videoUrl: string,
  outputLocationPath: string
): Promise<void> {
  const response = await fetch(videoUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${response.statusText}`);
  }

  const writer: fs.WriteStream = fs.createWriteStream(outputLocationPath);
  if (!response.body) {
    throw new Error("Failed to fetch video: Response body is empty");
  }
  const nodeStream: Readable = Readable.fromWeb(response.body as any);
  await finished(nodeStream.pipe(writer));
}

export const eventHandlers: Record<string, EventHandler> = {
  GOOGLE_CALENDAR: {
    checkTrigger: async (
      action: Action,
      actionData: any,
      service: Service
    ): Promise<boolean | undefined> => {
      const auth: OAuth2Client = googleAuth(service);
      const calendar = google.calendar({ version: "v3", auth });

      if (action.name === "New event added") {
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
      } else {
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
  GMAIL: {
    executeReaction: async (
      reaction: Reaction,
      reactionData: any,
      service: Service
    ): Promise<void> => {
      switch (reaction.name) {
        case "Send an email":
          await sendEmail(
            service,
            reactionData.toAddress,
            reactionData.subject,
            reactionData.body
          );
          break;

        case "Send yourself an email":
          await sendEmail(
            service,
            reactionData.account,
            reactionData.subject,
            reactionData.body
          );
          break;

        default:
          console.error(`Unknown GMAIL reaction: ${reaction.name}`);
      }
    },
  },
  YOUTUBE: {
    executeReaction: async (
      reaction: Reaction,
      reactionData: any,
      service: Service
    ): Promise<void> => {
      const auth: OAuth2Client = googleAuth(service);
      const youtube = google.youtube({ version: "v3", auth });

      if (reaction.name === "Upload video from URL") {
        console.log("Uploading video from URL:", reactionData.videoUrl);
        const videoPath: string = path.join(__dirname, "temp_video.mp4");
        await downloadVideo(reactionData.videoUrl, videoPath);

        await youtube.videos.insert({
          part: ["snippet", "status"],
          requestBody: {
            snippet: {
              title: reactionData.title,
              description: reactionData.description,
            },
            status: {
              privacyStatus: "public",
            },
          },
          media: {
            body: fs.createReadStream(videoPath),
          },
        });

        fs.unlinkSync(videoPath);
      } else {
        console.error(`Unknown YouTube reaction: ${reaction.name}`);
      }
    },
  },
};
