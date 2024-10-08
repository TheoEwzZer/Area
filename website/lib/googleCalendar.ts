import { currentUser, User } from "@clerk/nextjs/server";
import { Service } from "@prisma/client";
import { GaxiosResponse } from "gaxios";
import { OAuth2Client } from "google-auth-library";
import { calendar_v3, google } from "googleapis";
import { db } from "./db";

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { token } = await oauth2Client.getAccessToken();

  if (!token) {
    throw new Error("Failed to refresh access token");
  }

  return token;
}

export async function getGoogleCalendarAccessToken(): Promise<string> {
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
      service: "GOOGLE_CALENDAR",
    },
  });

  if (!service) {
    throw new Error("Google Calendar service not found for user");
  }
  return service.accessToken;
}

function createOAuth2Client(accessToken: string): OAuth2Client {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oAuth2Client.setCredentials({ access_token: accessToken });
  return oAuth2Client;
}

export async function getCalendars(accessToken: string): Promise<
  {
    id: string | null | undefined;
    name: string | null | undefined;
  }[]
> {
  try {
    const auth: OAuth2Client = createOAuth2Client(accessToken);
    const service: calendar_v3.Calendar = google.calendar({
      version: "v3",
      auth,
    });
    const res: GaxiosResponse<calendar_v3.Schema$CalendarList> =
      await service.calendarList.list();
    return (
      res.data.items?.map((calendar: calendar_v3.Schema$CalendarListEntry) => ({
        id: calendar.id,
        name: calendar.summary,
      })) || []
    );
  } catch {
    try {
      const user: User | null = await currentUser();
      if (!user?.id) {
        throw new Error("User not found or user ID is missing");
      }

      const service: Service | null = await db.service.findFirst({
        where: {
          userId: user.id,
          service: "GOOGLE_CALENDAR",
        },
      });

      if (!service?.refreshToken) {
        throw new Error(
          "Google Calendar service or refresh token not found for user"
        );
      }

      const newAccessToken: string = await refreshAccessToken(
        service.refreshToken
      );

      await db.service.update({
        where: { id: service.id },
        data: { accessToken: newAccessToken },
      });

      const auth: OAuth2Client = createOAuth2Client(newAccessToken);
      const calendarService: calendar_v3.Calendar = google.calendar({
        version: "v3",
        auth,
      });
      const res: GaxiosResponse<calendar_v3.Schema$CalendarList> =
        await calendarService.calendarList.list();
      return (
        res.data.items?.map(
          (calendar: calendar_v3.Schema$CalendarListEntry) => ({
            id: calendar.id,
            name: calendar.summary,
          })
        ) || []
      );
    } catch (refreshError) {
      console.error("Error refreshing token and retrying", refreshError);
      return [];
    }
  }
}
