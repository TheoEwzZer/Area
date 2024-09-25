import { currentUser, User } from "@clerk/nextjs/server";
import { Service } from "@prisma/client";
import { GaxiosResponse } from "gaxios";
import { OAuth2Client } from "google-auth-library";
import { gmail_v1, google } from "googleapis";
import { db } from "./db";

export async function getGmailAccessToken(): Promise<string> {
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
      service: "GMAIL",
    },
  });

  if (!service) {
    throw new Error("Gmail service not found for user");
  }
  return service.accessToken;
}

function createOAuth2Client(accessToken: string): OAuth2Client {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: accessToken });
  return oAuth2Client;
}

export async function getGmailUserAccount(accessToken: string): Promise<{
  id: string | null | undefined;
  value: string | null | undefined;
}> {
  const auth: OAuth2Client = createOAuth2Client(accessToken);
  const service: gmail_v1.Gmail = google.gmail({
    version: "v1",
    auth,
  });
  const res: GaxiosResponse<gmail_v1.Schema$Profile> =
    await service.users.getProfile({
      userId: "me",
    });

  const profile: gmail_v1.Schema$Profile = res.data;

  return {
    id: profile?.emailAddress,
    value: profile?.emailAddress,
  };
}
