import { currentUser, User } from "@clerk/nextjs/server";
import { Service } from "@prisma/client";
import { GaxiosResponse } from "gaxios";
import { OAuth2Client } from "google-auth-library";
import { calendar_v3, google } from "googleapis";
import { db } from "./db";

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
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: accessToken });
  return oAuth2Client;
}

export async function getCalendars(accessToken: string): Promise<
  {
    id: string | null | undefined;
    name: string | null | undefined;
  }[]
> {
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
}
